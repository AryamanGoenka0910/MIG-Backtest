from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.leaderboard import LeaderboardResponse
from app.services.leaderboard_service import get_leaderboard

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardResponse)
def leaderboard(db: Session = Depends(get_db)) -> LeaderboardResponse:
    entries = get_leaderboard(db)
    return LeaderboardResponse(
        entries=entries,
        updated_at=datetime.now(timezone.utc),
    )
