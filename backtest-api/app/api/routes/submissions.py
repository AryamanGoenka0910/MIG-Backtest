from __future__ import annotations

import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.config import settings
from app.models.submission import SubmissionStatus
from app.schemas.submission import SubmissionResponse, SubmissionUploadResponse
from app.services.submission_service import count_today_submissions, create_submission, get_submission, list_submissions
from app.utils.validation import validate_strategy_file, validate_submission_zip

router = APIRouter(prefix="/submissions", tags=["submissions"])

@router.post(
    "/upload",
    response_model=SubmissionUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_submission(
    user_id: Annotated[str, Form()],
    team_id: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    db: Session = Depends(get_db),
):
    filename = file.filename or ""
    is_zip = filename.lower().endswith(".zip")
    is_py = filename.lower().endswith(".py")

    if not is_zip and not is_py:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only .py or .zip files are accepted.",
        )

    daily_count = count_today_submissions(db, team_id)
    if daily_count >= settings.MAX_DAILY_SUBMISSIONS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily submission limit of {settings.MAX_DAILY_SUBMISSIONS} reached. Try again tomorrow.",
        )

    content = await file.read()

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file is empty.",
        )

    max_size = settings.MAX_ZIP_SIZE_BYTES if is_zip else settings.MAX_FILE_SIZE_BYTES
    if len(content) > max_size:
        limit_str = f"{max_size // 1_048_576} MB" if is_zip else f"{max_size // 1024} KB"
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {limit_str}.",
        )

    # Validate contents via temp file
    suffix = ".zip" if is_zip else ".py"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    try:
        error = validate_submission_zip(tmp_path) if is_zip else validate_strategy_file(tmp_path)
    finally:
        tmp_path.unlink(missing_ok=True)

    if error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error,
        )

    submission = create_submission(
        db=db,
        user_id=user_id,
        team_id=team_id,
        filename=filename,
        file_content=content,
        is_zip=is_zip,
    )
    return submission


@router.get("/daily-count/{team_id}")
def daily_submission_count(
    team_id: str,
    db: Session = Depends(get_db),
):
    count = count_today_submissions(db, team_id)
    return {"team_id": team_id, "count": count, "limit": settings.MAX_DAILY_SUBMISSIONS}


@router.get("/list-submissions/{team_id}", response_model=List[SubmissionResponse])
def list_all_submissions(
    team_id: str,
    db: Session = Depends(get_db),
):
    submissions = list_submissions(db, team_id=team_id)
    return submissions


@router.get("/admin/all", response_model=List[SubmissionResponse])
def admin_list_all_submissions(db: Session = Depends(get_db)):
    submissions = list_submissions(db, team_id=None)
    return submissions


@router.get("/get-submission/{submission_id}", response_model=SubmissionResponse)
def get_submission_by_id(
    submission_id: int,
    db: Session = Depends(get_db),
):

    submission = get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")
    return submission


@router.post("/{submission_id}/requeue", response_model=SubmissionResponse)
def requeue_submission(
    submission_id: int,
    db: Session = Depends(get_db),
):
    submission = get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")
    submission.status = SubmissionStatus.queued
    submission.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(submission)
    return submission
