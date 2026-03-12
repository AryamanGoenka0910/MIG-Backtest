"""
Example strategy for the MIG Backtesting Competition.

Your strategy must define a class named `Strategy` with a single method:
    on_tick(self, row) -> str

`row` is a dict with the following keys:
    - "timestamp": str  (e.g. "2024-01-01 09:30")
    - "price":     float

Return one of:
    "BUY"  - enter a long position (ignored if already in a position)
    "SELL" - exit your long position (ignored if flat)
    "HOLD" - do nothing

You cannot short-sell. You start with $10,000 in cash.
One unit of the asset is traded per BUY/SELL signal.
"""


class Strategy:
    def __init__(self):
        self.prices = []
        self.short_window = 5
        self.long_window = 20

    def on_tick(self, row):
        price = row["price"]
        self.prices.append(price)

        # Not enough data yet
        if len(self.prices) < self.long_window:
            return "HOLD"

        short_ma = sum(self.prices[-self.short_window:]) / self.short_window
        long_ma = sum(self.prices[-self.long_window:]) / self.long_window

        if short_ma > long_ma:
            return "BUY"
        elif short_ma < long_ma:
            return "SELL"
        else:
            return "HOLD"
