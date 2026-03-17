"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Submission } from "@/lib/types/submissions";

interface SubmissionHistoryProps {
  submissions: Submission[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  const router = useRouter();

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl mb-3">
          📂
        </div>
        <p className="text-slate-500 text-sm">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Sharpe</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">PnL</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Max Drawdown</th>
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, i) => {
            const sharpe = sub.score?.sharpe ?? null;
            const pnl = sub.score?.pnl ?? null;
            const maxDrawdown = sub.score?.max_drawdown ?? null;

            return (
              <tr
                key={sub.id}
                onClick={() => router.push(`/submissions/${sub.id}`)}
                className={`border-b border-slate-200/40 dark:border-slate-800/40 cursor-pointer transition-colors ${
                  i % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/20" : "bg-transparent"
                } hover:bg-slate-100/50 dark:hover:bg-slate-800/30`}
              >
                <td className="px-4 py-3.5 mono-nums text-slate-400 dark:text-slate-600 text-xs">#{i + 1}</td>
                <td className="px-4 py-3.5 max-w-45">
                  <p className="font-mono text-slate-700 dark:text-slate-300 text-xs truncate">{sub.filename}</p>
                  {sub.validation_error && (
                    <p className="text-rose-400 text-xs mt-0.5 truncate" title={sub.validation_error}>
                      ⚠ {sub.validation_error.slice(0, 60)}…
                    </p>
                  )}
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-xs mono-nums hidden sm:table-cell">
                  {formatDate(sub.created_at)}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  {sharpe !== null ? (
                    <span className={`mono-nums font-semibold text-sm ${sharpe >= 1 ? "text-emerald-500 dark:text-emerald-400" : sharpe >= 0 ? "text-slate-700 dark:text-slate-300" : "text-rose-500 dark:text-rose-400"}`}>
                      {sharpe.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right hidden md:table-cell">
                  {pnl !== null ? (
                    <span className={`mono-nums text-sm ${pnl >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                      {pnl >= 0 ? "+" : ""}${Math.abs(pnl / 1000).toFixed(1)}k
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right hidden md:table-cell">
                  {maxDrawdown !== null ? (
                    <span className={`mono-nums text-sm text-slate-700 dark:text-slate-300`}>
                      {maxDrawdown * 100 >= 0 ? "+" : ""}{(maxDrawdown * 100).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-slate-400 dark:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
