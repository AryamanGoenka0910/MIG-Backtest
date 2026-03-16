"""
Background evaluation worker.

Polls the database for queued submissions, validates them, runs them
in Docker, and persists the results.
"""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import SessionLocal
from app.models.submission import Score, Submission, SubmissionStatus
from app.sandbox.docker_runner import DockerRunner

logger = logging.getLogger(__name__)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _pick_next_queued(db: Session) -> Optional[Submission]:
    return (
        db.query(Submission)
        .filter(Submission.status == SubmissionStatus.queued)
        .order_by(Submission.created_at)
        .first()
    )


def _set_status(db: Session, submission: Submission, status: SubmissionStatus) -> None:
    submission.status = status
    submission.updated_at = _now()
    db.commit()


def _save_logs(submission_id: int, stdout: str, stderr: str) -> Optional[str]:
    """Write run logs to disk, return the log file path."""
    try:
        logs_dir = settings.LOGS_DIR
        logs_dir.mkdir(parents=True, exist_ok=True)
        log_path = logs_dir / f"{submission_id}.log"
        with log_path.open("w", encoding="utf-8") as f:
            if stdout:
                f.write("=== STDOUT ===\n")
                f.write(stdout)
                f.write("\n")
            if stderr:
                f.write("=== STDERR ===\n")
                f.write(stderr)
                f.write("\n")
        return str(log_path)
    except Exception as exc:
        logger.warning("Could not save logs for submission %d: %s", submission_id, exc)
        return None


def _process_submission(db: Session, submission: Submission) -> None:
    logger.info("Processing submission id=%d user_id=%s", submission.id, submission.user_id)

    # --- Step 1: Run in Docker ---
    _set_status(db, submission, SubmissionStatus.running)
    runner = DockerRunner()
    result = runner.run(
        strategy_path=Path(submission.stored_path),
        timeout=settings.SUBMISSION_TIMEOUT_SECONDS,
        weights_path=Path(submission.weights_path) if submission.weights_path else None,
    )
    submission.runtime_seconds = result.runtime_seconds

    # Save logs regardless of outcome
    log_path = _save_logs(submission.id, result.stdout, result.stderr)
    submission.logs_path = log_path

    if result.timed_out:
        submission.status = SubmissionStatus.timed_out
        submission.validation_error = f"Execution timed out after {settings.SUBMISSION_TIMEOUT_SECONDS}s"
        submission.updated_at = _now()
        db.commit()
        logger.info("Submission %d timed out", submission.id)
        return

    if result.exit_code != 0:
        submission.status = SubmissionStatus.failed_runtime
        # Prefer stderr for the error message; truncate to avoid DB bloat
        submission.validation_error = (result.stderr or "Non-zero exit code")[:1000]
        submission.updated_at = _now()
        db.commit()
        logger.info("Submission %d failed at runtime: %s", submission.id, submission.validation_error)
        return

    # --- Step 2: Parse results ---
    try:
        metrics = json.loads(result.stdout)
        score = Score(
            submission_id=submission.id,
            pnl=float(metrics["pnl"]),
            sharpe=float(metrics["sharpe"]),
            max_drawdown=float(metrics["max_drawdown"]),
        )
        db.add(score)
        submission.status = SubmissionStatus.passed
        submission.updated_at = _now()
        db.commit()
        logger.info(
            "Submission %d passed. pnl=%.2f sharpe=%.4f max_dd=%.4f",
            submission.id,
            score.pnl,
            score.sharpe,
            score.max_drawdown,
        )
    except Exception as exc:
        submission.status = SubmissionStatus.failed_runtime
        submission.validation_error = f"Could not parse evaluation output: {exc}"
        submission.updated_at = _now()
        db.commit()
        logger.error("Submission %d parse error: %s", submission.id, exc)


def _run_next() -> None:
    """Synchronous helper — called in a thread-pool executor so it doesn't block the event loop."""
    db = SessionLocal()
    try:
        submission = _pick_next_queued(db)
        if submission:
            _process_submission(db, submission)
    finally:
        db.close()


async def run_worker() -> None:
    """Main worker loop. Runs as a background asyncio task."""
    logger.info("Evaluation worker started (poll interval=%ds)", settings.WORKER_POLL_INTERVAL_SECONDS)
    loop = asyncio.get_running_loop()
    while True:
        try:
            await loop.run_in_executor(None, _run_next)
        except Exception as exc:
            logger.exception("Unexpected worker error: %s", exc)

        await asyncio.sleep(settings.WORKER_POLL_INTERVAL_SECONDS)
