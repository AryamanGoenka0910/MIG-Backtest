"""
Example strategy 2 for the MIG Backtesting Competition.

Uses TA-Lib to compute SMAs and trade a crossover signal.

Your file must define a top-level function:

    get_actions(prices: np.ndarray) -> np.ndarray

Arguments:
    prices  -- numpy array of shape (num_stocks, num_days)
               containing the Open price for each stock on each day.
               Rows are stocks (sorted by ticker), columns are days.

Returns:
    actions -- numpy array of the same shape (num_stocks, num_days).
               Each value is the number of shares to HOLD on that day.
               Positive = long position, 0 = flat.
               The backtester converts changes between days into trades.

You start with $25,000 cash. Fractional shares are not supported.
"""

import numpy as np
import talib


def get_actions(prices: np.ndarray) -> np.ndarray:
    """
    SMA crossover strategy using TA-Lib.

    Buy (hold 1 share) when the 10-day SMA crosses above the 30-day SMA.
    Sell (hold 0 shares) when it crosses below.
    """
    num_stocks, num_days = prices.shape
    actions = np.zeros_like(prices)

    short_period = 10
    long_period = 30

    for i in range(num_stocks):
        price_series = prices[i].astype(float)

        sma_short = talib.SMA(price_series, timeperiod=short_period)
        sma_long = talib.SMA(price_series, timeperiod=long_period)

        for t in range(long_period, num_days):
            if np.isnan(sma_short[t]) or np.isnan(sma_long[t]):
                continue
            if sma_short[t] > sma_long[t]:
                actions[i, t] = 1  # hold 1 share
            else:
                actions[i, t] = 0  # flat

    return actions
