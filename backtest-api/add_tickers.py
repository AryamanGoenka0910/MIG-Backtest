import yfinance as yf
import pandas as pd
from pathlib import Path

TICKER_MAP = {
    "K": "AAPL", "L": "NVDA", "M": "TSLA", "N": "PFE",  "O": "BMY",
    "P": "XOM",  "Q": "SLB",  "R": "JPM",  "S": "GS",   "T": "MCD",
    "U": "NKE",  "V": "PG",   "W": "CAT",  "X": "BA",   "Y": "FCX",
    "Z": "NEE",  "AA": "AMT", "AB": "ORCL","AC": "CSCO","AD": "TSM",
}

FILES = {
    "dev_data.csv":          ("2017-03-14", "2021-03-15"),
    "public_test_data.csv":  ("2021-03-14", "2023-03-15"),
    "private_test_data.csv": ("2023-03-14", "2025-03-15"),
}

BASE = Path("/Users/aryamangoenka/Desktop/mig_backtest/backtest-api")

def fmt_date(ts):
    return f"{ts.month}/{ts.day}/{str(ts.year)[2:]}"

def fmt_volume(v):
    try:
        return f"{int(v):,}"
    except:
        return str(v)

for filename, (start, end) in FILES.items():
    path = BASE / filename
    stem = Path(filename).stem
    out_path = BASE / f"{stem}_30.csv"
    print(f"\nProcessing {filename} ({start} -> {end})...")

    existing_df = pd.read_csv(path)
    ref_dates = pd.to_datetime(
        existing_df[existing_df["Ticker"] == "A"]["Date"], format="%m/%d/%y"
    )
    date_set = set(ref_dates)
    print(f"  Reference trading days: {len(date_set)}")

    new_rows = []
    for alias, real_ticker in TICKER_MAP.items():
        print(f"  Pulling {real_ticker} -> {alias}...", end=" ")
        try:
            raw = yf.download(real_ticker, start=start, end=end,
                              auto_adjust=False, progress=False)
            if raw.empty:
                print("NO DATA")
                continue

            if isinstance(raw.columns, pd.MultiIndex):
                raw.columns = raw.columns.get_level_values(0)

            aligned = raw[raw.index.isin(date_set)]
            missing = len(date_set) - len(aligned)
            if missing > 0:
                print(f"WARNING: {missing} missing days", end=" ")

            for ts, row in aligned.iterrows():
                new_rows.append({
                    "Ticker":     alias,
                    "Date":       fmt_date(ts),
                    "Open":       round(float(row["Open"]), 2),
                    "High":       round(float(row["High"]), 2),
                    "Low":        round(float(row["Low"]), 2),
                    "Close":      round(float(row["Close"]), 2),
                    "Adj. Close": round(float(row["Adj Close"]), 2),
                    "Volume":     fmt_volume(row["Volume"]),
                })
            print(f"{len(aligned)} rows OK")
        except Exception as e:
            print(f"ERROR: {e}")

    new_df = pd.DataFrame(new_rows, columns=["Ticker","Date","Open","High","Low","Close","Adj. Close","Volume"])
    combined = pd.concat([existing_df, new_df], ignore_index=True)
    combined.to_csv(out_path, index=False)
    print(f"  -> {out_path.name}: {len(combined)} rows ({combined['Ticker'].nunique()} tickers)")

print("\nDone.")
