import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LeaderboardView from "@/components/leaderboard/LeaderboardView";
import type { Team } from "@/types";

type LeaderboardEntry = {
  rank: number;
  team_id: string;
  best_pnl: number;
  best_sharpe: number;
  best_max_drawdown: number;
  submission_count: number;
  last_submitted: string;
};

type TeamProfile = {
  team_id: string | number;
  team_name: string | null;
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch leaderboard scores from backend
  let entries: LeaderboardEntry[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leaderboard`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      entries = data.entries ?? [];
    }
  } catch {
    // backend unreachable — show empty leaderboard
  }

  // Fetch team names from Supabase Teams table
  const teamIds = entries.map((e) => e.team_id);
  let teamNameMap: Record<string, string> = {};
  if (teamIds.length > 0) {
    const { data: teams } = await supabase
      .from("Teams")
      .select("team_id, team_name")
      .in("team_id", teamIds);
    if (teams) {
      teamNameMap = Object.fromEntries(
        (teams as TeamProfile[]).map((t) => [String(t.team_id), t.team_name ?? ""])
      );
    }
  }

  // Map to Team interface
  const teams: Team[] = entries.map((entry) => {
    return {
      id: entry.team_id,
      name: teamNameMap[entry.team_id] || entry.team_id,
      school: "—",
      rank: entry.rank,
      pnl: entry.best_pnl,
      sharpe: entry.best_sharpe,
      maxDrawdown: entry.best_max_drawdown,
      status: "passed",
      submissionsCount: entry.submission_count,
      lastSubmitted: entry.last_submitted,
      sparklineData: [],
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">
              Rankings
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Leaderboard</h1>
          </div>
          {teams.length > 0 && (
            <p className="text-slate-500 text-sm">
              <span className="text-slate-700 dark:text-slate-300 font-medium mono-nums">{teams.length}</span> teams scored
            </p>
          )}
        </div>
      </div>
      {teams.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl mb-4">
            📊
          </div>
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-lg mb-2">No results yet</h3>
          <p className="text-slate-500">Leaderboard will populate once submissions are scored.</p>
        </div>
      ) : (
        <LeaderboardView teams={teams} />
      )}
    </div>
  );
}
