"""
Example strategy for the MIG Backtesting Competition.

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


def get_actions(prices: np.ndarray) -> np.ndarray:
    """
    Simple moving-average crossover strategy applied independently
    to each stock.

    Buy (hold 1 share) when the 5-day MA crosses above the 20-day MA.
    Sell (hold 0 shares) when it crosses below.
    """
    num_stocks, num_days = prices.shape
    actions = np.zeros_like(prices)

    short_window = 5
    long_window = 20

    for i in range(num_stocks):
        for t in range(long_window, num_days):
            short_ma = prices[i, t - short_window:t].mean()
            long_ma = prices[i, t - long_window:t].mean()
            if short_ma > long_ma:
                actions[i, t] = 1  # hold 1 share
            else:
                actions[i, t] = 0  # flat

    return actions
