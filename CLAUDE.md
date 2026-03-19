# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MIG Backtest is a quantitative trading competition platform. Teams submit Python strategies that are backtested against market data in an isolated Docker sandbox. Results are ranked on a leaderboard.

Two independent apps:
- **`mig-backtest-ui/`** — Next.js 16 frontend (Vercel)
- **`backtest-api/`** — FastAPI backend (DigitalOcean Droplet)

## Frontend Commands

```bash
cd mig-backtest-ui
pnpm dev          # Dev server at localhost:3000
pnpm build        # Production build
pnpm lint         # ESLint
```

Package manager is **pnpm** (not npm/yarn).

## Backend Commands

```bash
cd backtest-api
uvicorn app.main:app --reload         # Dev server at localhost:8000
docker build -t mig-sandbox:latest -f sandbox_image/Dockerfile .  # Rebuild sandbox
```

Production runs via systemd on DigitalOcean (`systemctl restart mig-backtest`).

## Architecture

### Frontend (Next.js 16, React 19, TypeScript 5, Tailwind v4)

- **Tailwind v4**: No `tailwind.config.js`. Config is in `app/globals.css` via `@theme inline`. Custom tokens like `--color-accent-emerald` → `bg-accent-emerald`. Dark-mode-first; no `dark:` prefix needed.
- **Auth**: Supabase (`lib/supabase/`). Client uses `NEXT_PUBLIC_SUPABASE_*` env vars; server-side uses `SUPABASE_SERVICE_ROLE_KEY`.
- **Backend calls**: All in `lib/api/submissions.ts` via `fetch()` against `NEXT_PUBLIC_BACKEND_URL`.
- **Leaderboard**: ISR with `revalidate: 30`.
- **Client components**: Any page using `Tabs` render-prop children or recharts must be `"use client"`.
- **Financial numbers**: Use `mono-nums` CSS class.

### Backend (FastAPI, PostgreSQL, SQLAlchemy)

**Submission lifecycle**: `queued` → `running` → `passed` | `failed_runtime` | `timed_out`

**Key flow**: Upload endpoint stores file → background worker polls queue → Docker sandbox executes user strategy + backtester → results written to `scores` table.

**Strategy contract** — user file must define:
```python
def get_actions(prices: np.ndarray) -> np.ndarray:
    # prices: (num_stocks, num_days) — daily open prices
    # returns: (num_stocks, num_days) — shares to buy(+)/sell(-)
```

Sandbox constraints: 1 MB file, 60s timeout, 512 MB RAM, no network, numpy/pandas only.

**Backtester** (`backtester.py`): $25,000 initial cash, 5 bps transaction cost, ±100 shares position limit, 1-day trade lag. Scores: PnL, Sharpe (annualized √252), max drawdown.

**Key env vars** (`.env`, copy from `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string (required)
- `DATA_PATH` — market data CSV
- `SANDBOX_IMAGE` — Docker image name (`mig-sandbox:latest`)
- `MAX_DAILY_SUBMISSIONS` — default 5

**API docs**: `http://localhost:8000/docs` when running locally.

### Data

Market data CSVs live in `backtest-api/`: `public_test_data_{10,30}.csv`, `private_test_data_{10,30}.csv`, `dev_data_{10,30}.csv`. 50-ticker OHLCV, 10-day and 30-day windows.
