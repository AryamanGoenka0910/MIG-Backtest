from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.submission import Submission, SubmissionStatus
from app.storage.file_store import save_upload, save_zip_submission


def create_submission(
    db: Session,
    user_id: str,
    team_id: str,
    filename: str,
    file_content: bytes,
    is_zip: bool = False,
) -> Submission:
    """
    Persist a new submission record and save files to disk.
    For .py uploads: saves strategy.py directly.
    For .zip uploads: extracts strategy.py + optional weights file.
    """
    submission = Submission(
        user_id=user_id,
        team_id=team_id,
        filename=filename,
        stored_path="",  # filled in after flush
        status=SubmissionStatus.queued,
    )
    db.add(submission)
    db.flush()  # assigns submission.id without committing

    if is_zip:
        strategy_path, weights_path = save_zip_submission(submission.id, file_content)
    else:
        strategy_path, weights_path = save_upload(submission.id, file_content)

    submission.stored_path = str(strategy_path)
    if weights_path:
        submission.weights_path = str(weights_path)

    db.commit()
    db.refresh(submission)
    return submission


def count_today_submissions(db: Session, team_id: str) -> int:
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    q = db.query(Submission)
    if team_id is not None:
        q = q.filter(Submission.team_id == team_id)
    q = q.filter(Submission.created_at >= today)
    return q.count()
    


def get_submission(db: Session, submission_id: int) -> Optional[Submission]:
    return db.query(Submission).filter(Submission.id == submission_id).first()


def list_submissions(
    db: Session,
    team_id: str,
) -> List[Submission]:
    q = db.query(Submission)
    if team_id is not None:
        q = q.filter(Submission.team_id == team_id)
    return q.order_by(Submission.created_at.desc()).all()
