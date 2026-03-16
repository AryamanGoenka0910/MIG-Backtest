from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LeaderboardEntry(BaseModel):
    rank: int
    team_id: str
    best_pnl: float
    best_sharpe: float
    best_max_drawdown: float
    submission_count: int
    last_submitted: datetime

    model_config = ConfigDict(from_attributes=True)


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    updated_at: datetime
