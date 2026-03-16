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

## Production Deployment (DigitalOcean)

The backend runs directly on a Droplet (not inside Docker) so that the evaluation worker can spawn Docker sandbox containers using host-level volume mounts.

### Droplet spec
- Ubuntu 22.04, 2 GB RAM minimum
- IP: `165.22.15.61`
- Code lives at: `/opt/MIG-Backtest/backtest-api/`
- Service managed by systemd: `mig-backtest.service`

### Services running on the Droplet
| Service | How it runs |
|---------|-------------|
| FastAPI + uvicorn | systemd service on port 8000 |
| PostgreSQL | Docker container (`postgres:16`, port 5432 localhost-only) |
| Sandbox image | `mig-sandbox:latest` built locally on the Droplet |

### Initial setup (already done)
```bash
# 1. Install Docker + Python 3.11
curl -fsSL https://get.docker.com | sh
apt install -y python3.11 python3.11-venv python3-pip libpq-dev

# 2. Clone the repo (generate SSH key on droplet and add to GitHub first)
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub   # copy this to GitHub → Settings → SSH and GPG keys
cd /opt
git clone git@github.com:AryamanGoenka0910/MIG-Backtest.git
cd MIG-Backtest/backtest-api

# 3. Start PostgreSQL
docker run -d --name postgres --restart always \
  -e POSTGRES_DB=mig_backtest \
  -e POSTGRES_USER=mig \
  -e POSTGRES_PASSWORD=<password> \
  -p 127.0.0.1:5432:5432 \
  postgres:16

# 4. Build sandbox image (from /opt/MIG-Backtest/backtest-api/)
docker build -t mig-sandbox:latest -f sandbox_image/Dockerfile .

# 5. Create venv and install deps
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### `.env` on the Droplet
Located at `/opt/MIG-Backtest/backtest-api/.env`:
```
DATABASE_URL=postgresql://mig:<password>@localhost:5432/mig_backtest
UPLOAD_DIR=/opt/MIG-Backtest/backtest-api/uploads
LOGS_DIR=/opt/MIG-Backtest/backtest-api/logs
DATA_PATH=/opt/MIG-Backtest/backtest-api/public_test_data.csv
SANDBOX_IMAGE=mig-sandbox:latest
SUBMISSION_TIMEOUT_SECONDS=60
MAX_FILE_SIZE_BYTES=1048576
MAX_ZIP_SIZE_BYTES=52428800
WORKER_POLL_INTERVAL_SECONDS=5
MAX_DAILY_SUBMISSIONS=5
```

> `UPLOAD_DIR`, `LOGS_DIR`, and `DATA_PATH` must be absolute paths — Docker volume mounts require them.

### systemd service
`/etc/systemd/system/mig-backtest.service`:
```ini
[Unit]
Description=MIG Backtest API
After=network.target

[Service]
User=root
WorkingDirectory=/opt/MIG-Backtest/backtest-api
EnvironmentFile=/opt/MIG-Backtest/backtest-api/.env
ExecStart=/opt/MIG-Backtest/backtest-api/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```
```bash
systemctl daemon-reload && systemctl enable mig-backtest && systemctl start mig-backtest
```

### HTTPS via nginx + nip.io

The frontend is hosted on Vercel (HTTPS). Browsers block mixed content, so the API must also be served over HTTPS. Since the Droplet uses a raw IP (no custom domain), we use [nip.io](https://nip.io) as a free wildcard DNS and Let's Encrypt for the SSL cert.

**One-time setup (already done):**
```bash
apt install nginx certbot python3-certbot-nginx -y
```

`/etc/nginx/sites-available/mig-backtest`:
```nginx
server {
    server_name 165.22.15.61.nip.io;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/mig-backtest /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d 165.22.15.61.nip.io
```

The API is now reachable at `https://165.22.15.61.nip.io`. The frontend `.env.local` should set:
```
NEXT_PUBLIC_API_URL=https://165.22.15.61.nip.io
```

---

### Deploying updates

**Preferred method — git pull:**
```bash
# on Droplet
cd /opt/MIG-Backtest
git pull
systemctl restart mig-backtest
```

# on Droplet
systemctl restart mig-backtest
```

**Sandbox image change** (e.g. added a package to `sandbox_image/requirements.txt`):
```bash
# on Droplet after rsyncing
cd /opt/MIG-Backtest/backtest-api
docker build -t mig-sandbox:latest -f sandbox_image/Dockerfile .
# no service restart needed
```

### Firewall (ufw)
```bash
ufw allow 22    # SSH
ufw allow 80    # nginx HTTP
ufw allow 443   # nginx HTTPS
ufw allow 8000  # API (direct, for debugging)
ufw enable
```

### Useful commands
```bash
systemctl daemon-reload                        # reload systemd after editing .service file
systemctl status mig-backtest                  # check service health
systemctl restart mig-backtest                 # restart after code update
journalctl -u mig-backtest -n 50               # view last 50 log lines
curl http://localhost:8000/health              # quick sanity check
curl http://localhost:8000/leaderboard         # verify DB connection
docker ps                                      # check postgres container
```

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

