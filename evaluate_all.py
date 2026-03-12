"""
Run this script manually before the conference to evaluate all submissions.

Usage:
    python evaluate_all.py
"""

from database import get_all_submissions, init_db, update_score
from backtester import run_backtest


def main():
    init_db()
    submissions = get_all_submissions()

    if not submissions:
        print("No submissions found.")
        return

    print(f"Evaluating {len(submissions)} submission(s)...\n")

    results = []
    for sub in submissions:
        print(f"[{sub['id']}] {sub['name']} ({sub['school']})")
        score = run_backtest(sub["file_path"])
        update_score(sub["id"], score)
        results.append((sub["name"], sub["school"], score))
        print()

    results.sort(key=lambda x: x[2], reverse=True)

    print("=" * 50)
    print(f"{'Rank':<6} {'Name':<20} {'School':<20} {'Score':>10}")
    print("-" * 50)
    for rank, (name, school, score) in enumerate(results, start=1):
        print(f"{rank:<6} {name:<20} {school:<20} {score:>10.2f}")
    print("=" * 50)


if __name__ == "__main__":
    main()
