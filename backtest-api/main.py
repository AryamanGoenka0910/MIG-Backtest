import os
from datetime import datetime

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from database import get_db, init_db
from models import LeaderboardEntry

app = FastAPI(title="Trading Competition")

SUBMISSIONS_DIR = "submissions"


@app.on_event("startup")
def startup():
    init_db()
    os.makedirs(SUBMISSIONS_DIR, exist_ok=True)


@app.post("/submit")
async def submit(
    name: str = Form(...),
    school: str = Form(...),
    file: UploadFile = File(...),
):
    if not file.filename.endswith(".py"):
        raise HTTPException(status_code=400, detail="File must be a .py file")

    contents = await file.read()

    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO submissions (name, school, file_path, timestamp) VALUES (?, ?, ?, ?)",
        (name, school, "", datetime.utcnow().isoformat()),
    )
    submission_id = cursor.lastrowid
    conn.commit()

    file_path = os.path.join(SUBMISSIONS_DIR, f"{submission_id}_{name}.py")
    with open(file_path, "wb") as f:
        f.write(contents)

    conn.execute("UPDATE submissions SET file_path = ? WHERE id = ?", (file_path, submission_id))
    conn.commit()
    conn.close()

    return {"message": "Submission received", "id": submission_id}


@app.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard():
    conn = get_db()
    rows = conn.execute(
        "SELECT name, school, score FROM submissions WHERE score IS NOT NULL ORDER BY score DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
