"use client";

import { useRouter } from "next/navigation";
import type { Submission } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";

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
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl mb-3">
          📂
        </div>
        <p className="text-slate-500 text-sm">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/60">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Sharpe</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">PnL</th>
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, i) => (
            <tr
              key={sub.id}
              onClick={() => router.push(`/submissions/${sub.id}`)}
              className={`border-b border-slate-800/40 cursor-pointer transition-colors ${
                i % 2 === 0 ? "bg-slate-900/20" : "bg-transparent"
              } hover:bg-slate-800/30`}
            >
              <td className="px-4 py-3.5 mono-nums text-slate-600 text-xs">#{sub.id}</td>
              <td className="px-4 py-3.5 max-w-45">
                <p className="font-mono text-slate-300 text-xs truncate">{sub.fileName}</p>
                {sub.errorMessage && (
                  <p className="text-rose-400 text-xs mt-0.5 truncate" title={sub.errorMessage}>
                    ⚠ {sub.errorMessage.slice(0, 60)}…
                  </p>
                )}
              </td>
              <td className="px-4 py-3.5 text-slate-500 text-xs mono-nums hidden sm:table-cell">
                {formatDate(sub.timestamp)}
              </td>
              <td className="px-4 py-3.5 text-center">
                <StatusBadge status={sub.status} />
              </td>
              <td className="px-4 py-3.5 text-right">
                {sub.sharpe !== null ? (
                  <span className={`mono-nums font-semibold text-sm ${sub.sharpe >= 1 ? "text-emerald-400" : sub.sharpe >= 0 ? "text-slate-300" : "text-rose-400"}`}>
                    {sub.sharpe.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-right hidden md:table-cell">
                {sub.pnl !== null ? (
                  <span className={`mono-nums text-sm ${sub.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {sub.pnl >= 0 ? "+" : ""}${Math.abs(sub.pnl / 1000).toFixed(1)}k
                  </span>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
