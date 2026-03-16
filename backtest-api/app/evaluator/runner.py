"""
Evaluation runner — executes INSIDE the Docker sandbox container.

Expects:
  /sandbox/strategy.py  — user-submitted strategy file
  /sandbox/data.csv     — market data (read-only mount)

Outputs a single JSON line to stdout:
  {"pnl": float, "sharpe": float, "max_drawdown": float}

Any errors are written to stderr and the process exits with code 1.
"""

import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

# backtester.py is copied into /app/ inside the Docker image
sys.path.insert(0, "/app")
from backtester import Backtester  # noqa: E402

STRATEGY_PATH = Path("/sandbox/strategy.py")
DATA_PATH = Path("/sandbox/data.csv")

def load_prices(data_path: Path) -> np.ndarray:
    """
    Load market data CSV and return a price matrix of shape (num_stocks, num_days).
    Uses 'Open' column by default, matching the existing backtester convention.
    """
    df = pd.read_csv(data_path)
    df["Date"] = pd.to_datetime(df["Date"], format="%m/%d/%y")
    df.set_index(["Ticker", "Date"], inplace=True)

    tickers = sorted(df.index.get_level_values("Ticker").unique())
    prices = np.stack([df.loc[ticker]["Open"].values for ticker in tickers])
    return prices


def load_strategy(strategy_path: Path):
    spec = importlib.util.spec_from_file_location("user_strategy", strategy_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    # --- Load market data ---
    try:
        prices = load_prices(DATA_PATH)
    except Exception as exc:
        print(f"ERROR loading market data: {exc}", file=sys.stderr)
        sys.exit(1)

    # --- Load user strategy ---
    try:
        strategy_module = load_strategy(STRATEGY_PATH)
    except Exception as exc:
        print(f"ERROR importing strategy: {exc}", file=sys.stderr)
        sys.exit(1)

    if not hasattr(strategy_module, "get_actions"):
        print("ERROR: strategy does not define get_actions()", file=sys.stderr)
        sys.exit(1)

    # --- Call strategy ---
    try:
        actions = strategy_module.get_actions(prices)
    except Exception as exc:
        print(f"ERROR in get_actions(): {exc}", file=sys.stderr)
        sys.exit(1)

    # --- Validate output ---
    if not isinstance(actions, np.ndarray):
        print(
            f"ERROR: get_actions() must return np.ndarray, got {type(actions).__name__}",
            file=sys.stderr,
        )
        sys.exit(1)

    if actions.shape != prices.shape:
        print(
            f"ERROR: get_actions() returned shape {actions.shape}, expected {prices.shape}",
            file=sys.stderr,
        )
        sys.exit(1)

    # --- Run backtester ---
    try:
        bt = Backtester(prices, actions)
        _, pnl, sharpe, max_drawdown = bt.eval_actions(verbose=False)
    except Exception as exc:
        print(f"ERROR in backtester: {exc}", file=sys.stderr)
        sys.exit(1)

    if pnl is None or sharpe is None or max_drawdown is None:
        print("ERROR: backtester failed — portfolio likely went negative", file=sys.stderr)
        sys.exit(1)

    result = {
        "pnl": round(pnl, 4),
        "sharpe": round(float(sharpe), 6),
        "max_drawdown": round(max_drawdown, 6),
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
