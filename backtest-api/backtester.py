from collections import defaultdict, deque
import numpy as np
import argparse


class Backtester:
    def __init__(
        self,
        prices,
        actions,
        cash=25000,
        transaction_cost_bps=5.0,   # 5 bps = 0.05%
        max_abs_position=100,       # max shares long or short per stock
        lag_trades=True,            # execute submitted day-t trades at day t+1
    ):
        if prices.shape != actions.shape:
            raise ValueError(
                f"actions shape {actions.shape} does not match prices shape {prices.shape}"
            )

        prices = np.asarray(prices, dtype=float)
        actions = np.asarray(actions, dtype=float)

        if not np.isfinite(prices).all():
            raise ValueError("prices contains NaN or inf")
        if not np.isfinite(actions).all():
            raise ValueError("actions contains NaN or inf")

        # no fractional shares
        actions = np.round(actions).astype(int)

        self.stocks = prices.shape[0]
        self.days = prices.shape[1]
        self.prices = prices

        # Lag submitted trades by 1 day so actions[t] fill at prices[t+1]
        # Day 0 cannot be executed because there is no day -1 information.
        if lag_trades:
            lagged_actions = np.zeros_like(actions)
            lagged_actions[:, 1:] = actions[:, :-1]
            self.actions = lagged_actions
        else:
            self.actions = actions

        self.transaction_cost_bps = float(transaction_cost_bps)
        self.transaction_cost_rate = self.transaction_cost_bps / 10000.0
        self.max_abs_position = int(max_abs_position)

        self.initial_cash = float(cash)
        self.cash = float(cash)
        self.positions = [0] * self.stocks
        self.port_values = [0.0] * self.days

        # ticker -> deque([short_price, short_amount])
        self.short_positions = defaultdict(deque)

    def calc_pnl(self) -> float:
        return float(self.port_values[-1]) - self.initial_cash

    def calc_max_drawdown(self) -> float:
        arr = np.array(self.port_values, dtype=float)
        peak = np.maximum.accumulate(arr)
        with np.errstate(invalid="ignore", divide="ignore"):
            drawdowns = np.where(peak > 0, (arr - peak) / peak, 0.0)
        return float(np.min(drawdowns))

    def calc_sharpe_ratio(self):
        port_values = np.array(self.port_values, dtype=float)
        if len(port_values) < 2:
            return 0.0

        prev_values = np.concatenate([[self.initial_cash], port_values[:-1]])
        # daily return from previous portfolio value to current portfolio value
        daily_returns = (port_values - prev_values) / np.maximum(prev_values, 1e-12)
        daily_returns = daily_returns[np.isfinite(daily_returns)]

        if len(daily_returns) < 2:
            return 0.0

        volatility = np.std(daily_returns, ddof=1)
        if volatility == 0 or np.isnan(volatility):
            return 0.0

        return float(np.sqrt(252) * np.mean(daily_returns) / volatility)

    def calcShortValue(self, day):
        value = 0.0
        for stock in self.short_positions.keys():
            for short_price, short_amount in self.short_positions[stock]:
                value += (short_price - self.prices[stock][day]) * short_amount
        return value

    def calcPortfolioValue(self, day):
        value = self.cash

        for stock in range(self.stocks):
            if self.positions[stock] > 0:
                value += self.prices[stock][day] * self.positions[stock]

        value += self.calcShortValue(day)
        return value

    def _trade_fee(self, day, stock, shares):
        return abs(shares) * self.prices[stock][day] * self.transaction_cost_rate

    def buyLong(self, day, stock):
        requested = int(self.actions[stock][day])
        if requested <= 0:
            return

        # enforce max absolute position
        allowed = self.max_abs_position - max(self.positions[stock], 0)
        shares = min(requested, max(0, allowed))
        if shares <= 0:
            return

        trade_value = self.prices[stock][day] * shares
        fee = self._trade_fee(day, stock, shares)

        if self.cash >= trade_value + fee:
            self.cash -= (trade_value + fee)
            self.positions[stock] += shares

    def coverShort(self, day, stock):
        requested = int(self.actions[stock][day])
        if requested <= 0:
            return

        short_close_amount = requested

        # first cover existing short positions
        while short_close_amount > 0 and len(self.short_positions[stock]) > 0:
            positions_to_close = min(self.short_positions[stock][0][1], short_close_amount)
            short_close_amount -= positions_to_close
            self.positions[stock] += positions_to_close

            pnl_from_cover = (
                self.short_positions[stock][0][0] - self.prices[stock][day]
            ) * positions_to_close
            fee = self._trade_fee(day, stock, positions_to_close)
            self.cash += pnl_from_cover
            self.cash -= fee

            if positions_to_close == self.short_positions[stock][0][1]:
                self.short_positions[stock].popleft()
            else:
                self.short_positions[stock][0][1] -= positions_to_close

        # if any requested buy remains, open/increase long up to cap
        if short_close_amount > 0:
            allowed = self.max_abs_position - max(self.positions[stock], 0)
            shares = min(short_close_amount, max(0, allowed))
            if shares <= 0:
                return

            trade_value = self.prices[stock][day] * shares
            fee = self._trade_fee(day, stock, shares)

            if self.cash >= trade_value + fee:
                self.cash -= (trade_value + fee)
                self.positions[stock] += shares

    def sellLong(self, day, stock):
        requested = abs(int(self.actions[stock][day]))
        if requested <= 0:
            return

        sell_amount = min(requested, max(self.positions[stock], 0))
        short_amount = max(requested - sell_amount, 0)

        # sell existing long shares
        if sell_amount > 0:
            proceeds = self.prices[stock][day] * sell_amount
            fee = self._trade_fee(day, stock, sell_amount)
            self.cash += proceeds - fee
            self.positions[stock] -= sell_amount

        # then open short if requested and within cap
        if short_amount > 0:
            current_short = max(-self.positions[stock], 0)
            allowed_short = self.max_abs_position - current_short
            shares_to_short = min(short_amount, max(0, allowed_short))

            if shares_to_short > 0:
                fee = self._trade_fee(day, stock, shares_to_short)
                self.cash -= fee
                self.short_positions[stock].append([self.prices[stock][day], shares_to_short])
                self.positions[stock] -= shares_to_short

    def openShort(self, day, stock):
        requested = abs(int(self.actions[stock][day]))
        if requested <= 0:
            return

        current_short = max(-self.positions[stock], 0)
        allowed_short = self.max_abs_position - current_short
        shares = min(requested, max(0, allowed_short))
        if shares <= 0:
            return

        fee = self._trade_fee(day, stock, shares)
        self.cash -= fee
        self.short_positions[stock].append([self.prices[stock][day], shares])
        self.positions[stock] -= shares

    def eval_actions(self, verbose=True):
        try:
            return self._eval_actions(verbose)
        except Exception as e:
            print(f"BACKTEST FAILED: unexpected error — {e}")
            return None, None, None, None

    def _eval_actions(self, verbose=True):
        for day in range(self.days):
            if day > 0 and self.port_values[day - 1] < 0:
                print(
                    f"BACKTEST FAILED: portfolio went negative on day {day - 1} "
                    f"(value: {self.port_values[day - 1]:.2f}). Too many short positions."
                )
                return None, None, None, None

            for stock in range(self.stocks):
                action = self.actions[stock][day]

                if self.positions[stock] >= 0 and action > 0:
                    self.buyLong(day, stock)

                elif self.positions[stock] < 0 and action > 0:
                    self.coverShort(day, stock)

                elif self.positions[stock] > 0 and action < 0:
                    self.sellLong(day, stock)

                elif self.positions[stock] <= 0 and action < 0:
                    self.openShort(day, stock)

            self.port_values[day] = self.calcPortfolioValue(day)

        if verbose:
            print("final portfolio value:", self.port_values[-1])
            print("cash:", self.cash)
            print("positions:", self.positions)
            print("short position info:", self.short_positions)
            print("short value:", self.calcShortValue(self.days - 1))

        return (
            self.port_values,
            self.calc_pnl(),
            self.calc_sharpe_ratio(),
            self.calc_max_drawdown(),
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate actions")
    parser.add_argument("-a", "--actions", help="path to actions matrix file (.npy)")
    parser.add_argument("-p", "--prices", help="path to stock prices matrix file (.npy)")
    parser.add_argument("--cash", type=float, default=25000)
    parser.add_argument("--tcost-bps", type=float, default=5.0)
    parser.add_argument("--max-pos", type=int, default=100)
    parser.add_argument("--no-lag", action="store_true")

    args = parser.parse_args()

    prices = np.load(args.prices)
    actions = np.load(args.actions)

    print("price shape:", prices.shape)
    print("actions shape:", actions.shape)

    backtester = Backtester(
        prices,
        actions,
        cash=args.cash,
        transaction_cost_bps=args.tcost_bps,
        max_abs_position=args.max_pos,
        lag_trades=not args.no_lag,
    )
    print(backtester.eval_actions(verbose=True))

# --- Example ---
# 2 stocks, 5 days
# shape: (num_stocks, num_days)
#
# prices[stock][day] = price of that stock on that day
# actions[stock][day] = shares to buy (+) or sell/short (-) on that day, 0 = hold
#
# example_prices = np.array([
#     [100, 102, 105, 103, 108],   # stock 0 prices over 5 days
#     [ 50,  49,  51,  52,  48],   # stock 1 prices over 5 days
# ])
#
# example_actions = np.array([
#     [  5,   0,   0,  -5,   0],   # buy 5 shares of stock 0 on day 0, sell all on day 3
#     [  0,  -3,   0,   0,   3],   # short 3 shares of stock 1 on day 1, cover on day 4
# ])
#
# port_values, sharpe = eval_actions(example_actions, example_prices, cash=25000)