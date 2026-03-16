from collections import defaultdict, deque
import numpy as np
import argparse

# TODO: incorporate using open prices for buying and closing prices for selling (or should we just use close price?)

class Backtester:
    def __init__(self, prices, actions, cash=25000):
        if prices.shape != actions.shape:
            raise ValueError(f"actions shape {actions.shape} does not match prices shape {prices.shape}")

        # no fractional shares
        actions = np.round(actions).astype(int)

        ##METADATA
        self.stocks = len(prices)
        self.days = len(prices[0])
        self.prices = prices
        self.actions = actions

        ##PORTDATA
        self.initial_cash = cash
        self.cash = cash
        self.positions = [0] * self.stocks # position per stock
        self.port_values = [0] * self.days # portfolio value per day

        # shorts positions are closed in FIFO ordering
        # ticker -> dequeue(short price, short amount)
        self.short_positions = defaultdict(deque)

    def calc_pnl(self) -> float:
        return float(self.port_values[-1]) - self.initial_cash

    def calc_max_drawdown(self) -> float:
        """Returns the maximum drawdown as a negative decimal (e.g. -0.054)."""
        arr = np.array(self.port_values, dtype=float)
        peak = np.maximum.accumulate(arr)
        with np.errstate(invalid="ignore", divide="ignore"):
            drawdowns = np.where(peak > 0, (arr - peak) / peak, 0.0)
        return float(np.min(drawdowns))

    # returns annualized sharpe ratio
    def calc_sharpe_ratio(self):
        port_values = np.array(self.port_values, dtype=float)
        # use initial cash as day-0 baseline to avoid dividing by 0
        prev_values = np.concatenate([[self.initial_cash], port_values[:-1]])
        daily_returns = np.diff(port_values) / prev_values[1:]
        daily_returns = daily_returns[np.isfinite(daily_returns)]

        if len(daily_returns) < 2:
            return 0.0
        volatility = np.std(daily_returns, ddof=1)

        if volatility == 0 or np.isnan(volatility):
            return 0.0
        return np.sqrt(252) * np.mean(daily_returns) / volatility

    def calcShortValue(self, day):
        # calculates value of all the short positions on 'day'
        # note that this value can be positive or negative

        value = 0

        for stock in self.short_positions.keys():
            for short_price, short_amount in self.short_positions[stock]:
                value += (short_price - self.prices[stock][day]) * short_amount

        return value

    def calcPortfolioValue(self, day):
        # the sum of cash and positive positions (and their value on 'day') + short positions value
        # cash + long positions + short positions

        value = self.cash
        
        for stock in range(self.stocks):
            if self.positions[stock] > 0:
                value += self.prices[stock][day] * self.positions[stock]
        
        value += self.calcShortValue(day)
        return value

    def buyLong(self, day, stock):
        if (self.cash >= self.prices[stock][day] * self.actions[stock][day]):
            self.cash -= self.prices[stock][day] * self.actions[stock][day]
            self.positions[stock] += self.actions[stock][day]

    def coverShort(self, day, stock):
        # close short positions FIFO, then go long with any remainder
        short_close_amount = self.actions[stock][day]  # amount we want to buy to cover shorts and/or go long

        while short_close_amount > 0 and len(self.short_positions[stock]) > 0:
            positions_to_close = min(
                self.short_positions[stock][0][1], short_close_amount
            )
            short_close_amount -= positions_to_close
            self.positions[stock] += positions_to_close

            self.cash += (self.short_positions[stock][0][0] - self.prices[stock][day]) * positions_to_close
            if positions_to_close == self.short_positions[stock][0][1]:
                self.short_positions[stock].popleft()
            else:
                self.short_positions[stock][0][1] -= positions_to_close

        if short_close_amount > 0:
            if self.cash >= self.prices[stock][day] * short_close_amount:
                self.cash -= self.prices[stock][day] * short_close_amount
                self.positions[stock] += short_close_amount

    def sellLong(self, day, stock):
        # sell existing long shares, then open a short with any remainder
        sell_amount = min(abs(self.actions[stock][day]), self.positions[stock])
        short_amount = max(abs(self.actions[stock][day]) - self.positions[stock], 0)

        self.cash += self.prices[stock][day] * sell_amount
        self.positions[stock] -= sell_amount

        if short_amount > 0:
            self.short_positions[stock].append([self.prices[stock][day], short_amount])
            self.positions[stock] -= short_amount

    def openShort(self, day, stock):
        # open a new short position
        short_amount = abs(self.actions[stock][day])
        self.short_positions[stock].append([self.prices[stock][day], short_amount])
        self.positions[stock] -= short_amount

    def eval_actions(self, verbose=True):
        try:
            return self._eval_actions(verbose)
        except Exception as e:
            print(f"BACKTEST FAILED: unexpected error — {e}")
            return None, None, None, None

    def _eval_actions(self, verbose=True):
        # --- main logic ---
        for day in range(self.days):
            if day > 0 and self.port_values[day - 1] < 0:
                print(f"BACKTEST FAILED: portfolio went negative on day {day - 1} (value: {self.port_values[day - 1]:.2f}). Too many short positions.")
                return None, None, None, None

            for stock in range(self.stocks):
                # case 1: we have a positive position and are buying or don't have a position yet
                if self.positions[stock] >= 0 and self.actions[stock][day] > 0:
                    self.buyLong(day, stock)

                # case 2: we have a short position and are buying
                elif self.positions[stock] < 0 and self.actions[stock][day] > 0:
                    self.coverShort(day, stock)

                # case 3: we have a positive position and are selling/shorting
                elif self.positions[stock] > 0 and self.actions[stock][day] < 0:
                    self.sellLong(day, stock)

                # case 4: we have a short position and are selling/shorting or don't have any position yet
                elif self.positions[stock] <= 0 and self.actions[stock][day] < 0:
                    self.openShort(day, stock)

            self.port_values[day] = self.calcPortfolioValue(day)

        if verbose:
            print("final portfolio value:", self.port_values[-1])
            print("cash:", self.cash)
            print("positions:", self.positions)
            print("short position info:", self.short_positions)
            print("short value:", self.calcShortValue(len(self.actions[0]) - 1))

        return self.port_values, self.calc_pnl(), self.calc_sharpe_ratio(), self.calc_max_drawdown()
    

if __name__ == "__main__":
    # parse arguments
    parser = argparse.ArgumentParser(description="Evaluate actions")
    parser.add_argument(
        "-a",
        "--actions",
        help="path to actions matrix file (should be .npy file)",
    )
    parser.add_argument(
        "-p",
        "--prices",
        help="path to stock prices matrix file (should be .npy file)",
    )

    args = parser.parse_args()

    prices = np.load(args.prices)
    actions = np.load(args.actions)

    print("price shape:", prices.shape)
    print("actions shape:", actions.shape)

    backtester = Backtester(prices, actions)
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