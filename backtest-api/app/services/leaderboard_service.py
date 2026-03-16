from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.submission import Score, Submission, SubmissionStatus
from app.schemas.leaderboard import LeaderboardEntry


def get_leaderboard(db: Session) -> list[LeaderboardEntry]:
    # Fetch all passed submissions that have a score
    rows = (
        db.query(Submission, Score)
        .join(Score, Score.submission_id == Submission.id)
        .filter(Submission.status == SubmissionStatus.passed)
        .all()
    )

    # Per team: keep the submission with the highest PnL
    best: dict[str, tuple[Submission, Score]] = {}
    for sub, score in rows:
        if sub.team_id not in best or score.pnl > best[sub.team_id][1].pnl:
            best[sub.team_id] = (sub, score)

    # Total submission count per team (all statuses)
    counts: dict[str, int] = dict(
        db.query(Submission.team_id, func.count(Submission.id))
        .group_by(Submission.team_id)
        .all()
    )

    # Sort by best PnL descending and assign ranks
    sorted_teams = sorted(best.values(), key=lambda x: x[1].pnl, reverse=True)

    entries = []
    for rank, (sub, score) in enumerate(sorted_teams, start=1):
        entries.append(
            LeaderboardEntry(
                rank=rank,
                team_id=sub.team_id,
                best_pnl=score.pnl,
                best_sharpe=score.sharpe,
                best_max_drawdown=score.max_drawdown,
                submission_count=counts.get(sub.team_id, 0),
                last_submitted=sub.created_at,
            )
        )

    return entries
