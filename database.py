import sqlite3

DB_PATH = "competition.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT NOT NULL,
            school    TEXT NOT NULL,
            file_path TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            score     REAL
        )
    """)
    conn.commit()
    conn.close()


def get_all_submissions():
    conn = get_db()
    rows = conn.execute("SELECT * FROM submissions").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_score(submission_id: int, score: float):
    conn = get_db()
    conn.execute("UPDATE submissions SET score = ? WHERE id = ?", (score, submission_id))
    conn.commit()
    conn.close()
