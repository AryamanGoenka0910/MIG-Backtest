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
