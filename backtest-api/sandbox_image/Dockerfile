# Sandbox image for evaluating user-submitted strategies.
# Built from backtest-api/ directory so it can copy local files.
#
# Build command (run from backtest-api/):
#   docker build -t mig-sandbox:latest -f sandbox_image/Dockerfile .

FROM python:3.11-slim

WORKDIR /app

# Install only the packages strategies are allowed to use
# TA-Lib>=0.6.5 ships binary wheels with the C library bundled — no system deps needed.
COPY sandbox_image/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backtester (trusted internal code, read-only logic)
COPY backtester.py .

# Copy the evaluator entrypoint
COPY app/evaluator/runner.py .

# Drop privileges — run as non-root inside container
RUN useradd --no-create-home --shell /bin/false sandbox
USER sandbox

# The strategy file and market data are mounted at runtime:
#   /sandbox/strategy.py  (read-only)
#   /sandbox/data.csv     (read-only)
CMD ["python", "runner.py"]
