"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { adminGetAllSubmissions, requeueSubmission } from "@/lib/api/submissions";
import { createClient } from "@/lib/supabase/client";
import type { Submission } from "@/lib/types/submissions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requeueing, setRequeueing] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const data = await adminGetAllSubmissions();
      setSubmissions(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("Users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profile?.role !== "Admin") { router.push("/"); return; }

      setAuthChecked(true);
      load();
    });
  }, [router, load]);

  if (!authChecked) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="h-3 w-12 bg-slate-800 rounded animate-pulse mb-3" />
          <div className="h-9 w-56 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="glass-card rounded-2xl overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 px-6 flex items-center gap-4 border-b border-slate-800/60">
              <div className="h-3 w-8 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-48 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
              <div className="h-5 w-24 bg-slate-800 rounded-full animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  async function handleRequeue(id: number) {
    setRequeueing((prev) => new Set(prev).add(id));
    try {
      const updated = await requeueSubmission(id);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Requeue failed");
    } finally {
      setRequeueing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const statusOrder: Record<string, number> = {
    queued: 0,
    running: 1,
    passed: 2,
    failed_runtime: 3,
    timed_out: 4,
  };

  const sorted = [...submissions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const counts = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-rose-400 text-xs font-mono uppercase tracking-widest mb-2">
            Admin
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">All Submissions</h1>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 text-sm transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Status summary chips */}
      {!loading && submissions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(counts)
            .sort(([a], [b]) => (statusOrder[a] ?? 99) - (statusOrder[b] ?? 99))
            .map(([status, count]) => (
              <span
                key={status}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-400 font-mono"
              >
                <span className="text-slate-200 font-semibold">{count}</span>
                {status.replace("_", " ")}
              </span>
            ))}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-400 font-mono">
            <span className="text-slate-200 font-semibold">{submissions.length}</span>
            total
          </span>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-0 divide-y divide-slate-800/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 px-6 flex items-center gap-4">
                <div className="h-3 w-8 bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-48 bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-800 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-400 text-sm">{error}</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No submissions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider font-medium">
                  <th className="text-left px-6 py-3">ID</th>
                  <th className="text-left px-4 py-3">File</th>
                  <th className="text-left px-4 py-3">Team</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">PnL</th>
                  <th className="text-right px-4 py-3">Sharpe</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sorted.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-xs">
                      #{sub.id}
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <Link
                        href={`/submissions/${sub.id}`}
                        className="text-slate-300 hover:text-emerald-400 font-mono text-xs truncate block transition-colors"
                        title={sub.filename}
                      >
                        {sub.filename}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 max-w-[120px] truncate">
                      {sub.team_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right mono-nums text-xs">
                      {sub.score != null ? (
                        <span className={sub.score.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {sub.score.pnl >= 0 ? "+" : ""}${(sub.score.pnl / 1000).toFixed(2)}k
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right mono-nums text-xs">
                      {sub.score != null ? (
                        <span className={sub.score.sharpe >= 1 ? "text-emerald-400" : sub.score.sharpe >= 0 ? "text-slate-300" : "text-rose-400"}>
                          {sub.score.sharpe.toFixed(3)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(sub.created_at)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleRequeue(sub.id)}
                        disabled={requeueing.has(sub.id) || sub.status === "queued" || sub.status === "running"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {requeueing.has(sub.id) ? (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                        Rerun
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
