# MIG Backtest Competition API

FastAPI backend for the MIG quant trading competition. Accepts Python strategy files, validates them, runs them in an isolated Docker sandbox, and exposes results via REST endpoints.

## Stack

- **FastAPI** + **uvicorn** — HTTP API
- **SQLAlchemy** + **PostgreSQL** — storage
- **Docker** — sandboxed strategy execution
- **pydantic-settings** — env-based config

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — DATABASE_URL is required
```

### 3. Build the sandbox Docker image

Run from the `backtest-api/` directory:

```bash
docker build -t mig-sandbox:latest -f sandbox_image/Dockerfile .
```

> This bakes `backtester.py` and `app/evaluator/runner.py` into the image.
> Re-run this command whenever either file changes.

### 4. Start the API server

```bash
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/submissions/upload` | Upload a strategy file |
| `GET` | `/submissions` | List all submissions |
| `GET` | `/submissions/{id}` | Get submission detail + score |

### Upload a strategy

```bash
curl -X POST http://localhost:8000/submissions/upload \
  -F "name=Alice" \
  -F "school=MIT" \
  -F "file=@my_strategy.py"
```

Response:
```json
{"id": 1, "status": "queued", "filename": "my_strategy.py", "created_at": "..."}
```

### Poll for result

```bash
curl http://localhost:8000/submissions/1
```

When complete:
```json
{
  "id": 1, "name": "Alice", "school": "MIT",
  "status": "passed",
  "score": {
    "pnl": 4832.5,
    "sharpe": 2.14,
    "max_drawdown": -0.054
  }
}
```

---

## Strategy Contract

A sample strategy repo is available here: **[mig-quant-conference-2026-sample](https://github.com/AryamanGoenka0910/mig-quant-conference-2026-sample/tree/main)**

Your Python file must define a top-level function:

```python
import numpy as np

def get_actions(prices: np.ndarray) -> np.ndarray:
    """
    prices: shape (num_stocks, num_days) — daily open prices
    returns: shape (num_stocks, num_days) — shares to buy (+) / sell (-) per day, 0 = hold
    """
    ...
```

**Constraints:**
- Max file size: 1 MB
- Execution timeout: 60 seconds
- Memory limit: 512 MB
- Network access: disabled
- Allowed packages: `numpy`, `pandas` (no additional installs)

---

## Submission Statuses

| Status | Meaning |
|--------|---------|
| `queued` | Waiting to be evaluated |
| `validating` | File is being validated |
| `running` | Executing in Docker sandbox |
| `passed` | Evaluation complete, score stored |
| `failed_validation` | Bad file extension, syntax error, or missing `get_actions` |
| `failed_runtime` | Strategy crashed or returned invalid output |
| `timed_out` | Exceeded the 60s timeout |

---

## Project Structure

```
backtest-api/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # pydantic-settings config
│   ├── api/routes/              # HTTP route handlers
│   ├── db/                      # SQLAlchemy engine + session
│   ├── models/                  # ORM models (Submission, Score)
│   ├── schemas/                 # Pydantic response schemas
│   ├── services/                # Business logic
│   ├── workers/                 # Background evaluation loop
│   ├── sandbox/                 # Docker runner
│   ├── storage/                 # File persistence
│   ├── evaluator/runner.py      # Executed inside Docker
│   └── utils/validation.py     # Strategy file validation
├── sandbox_image/
│   └── Dockerfile               # Sandbox container image
├── backtester.py                # Core backtesting engine (untouched)
├── train_data_50.csv            # Market data
├── requirements.txt
└── .env.example
```

