import type { Submission, DailyCountResponse } from "@/lib/types/submissions";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

/** All submissions for a team (used for submission history + total count). */
export async function getTeamSubmissions(teamId: string): Promise<Submission[]> {
  const res = await fetch(`${BASE}/submissions/list-submissions/${teamId}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Failed to fetch team submissions: ${res.status}`);
  const data = await res.json();
  return data;
}

/** Daily submission count + daily limit for a user. */
export async function getDailyCount(teamId: string): Promise<DailyCountResponse> {
  const res = await fetch(`${BASE}/submissions/daily-count/${teamId}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Failed to fetch daily count: ${res.status}`);
  const data = await res.json();
  return data;
}

/** Admin: fetch all submissions across all teams. */
export async function adminGetAllSubmissions(): Promise<Submission[]> {
  const res = await fetch(`${BASE}/submissions/admin/all`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch all submissions: ${res.status}`);
  return res.json();
}

/** Fetch execution logs for a submission. Returns null if no log exists yet. */
export async function getSubmissionLogs(submissionId: number): Promise<string | null> {
  const res = await fetch(`${BASE}/submissions/${submissionId}/logs`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch logs for submission ${submissionId}: ${res.status}`);
  const data = await res.json();
  return data.logs;
}

/** Admin: requeue a submission by id. */
export async function requeueSubmission(submissionId: number): Promise<Submission> {
  const res = await fetch(`${BASE}/submissions/${submissionId}/requeue`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to requeue submission ${submissionId}: ${res.status}`);
  return res.json();
}
