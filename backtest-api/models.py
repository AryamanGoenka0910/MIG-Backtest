from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    name: str
    school: str
    score: float
