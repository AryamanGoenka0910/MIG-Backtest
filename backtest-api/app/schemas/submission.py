from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.submission import SubmissionStatus


class ScoreResponse(BaseModel):
    pnl: float
    sharpe: float
    max_drawdown: float
    scored_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubmissionResponse(BaseModel):
    id: int
    user_id: str
    team_id: str
    filename: str
    status: SubmissionStatus
    validation_error: Optional[str] = None
    runtime_seconds: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    score: Optional[ScoreResponse] = None

    model_config = ConfigDict(from_attributes=True)


class SubmissionUploadResponse(BaseModel):
    id: int
    status: SubmissionStatus
    filename: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
