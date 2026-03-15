import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import type { SubmissionStatus } from "@/types";

type Score = {
  pnl: number;
  sharpe: number;
  max_drawdown: number;
  scored_at: string;
};

type BackendSubmission = {
  id: number;
  user_id: string;
  team_id: string;
  filename: string;
  status: SubmissionStatus;
  validation_error: string | null;
  runtime_seconds: number | null;
  created_at: string;
  updated_at: string;
  score: Score | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const isFailed = (s: SubmissionStatus) =>
  s === "failed" || s === "failed_runtime" || s === "timed_out";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/submissions/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) notFound();

  const sub: BackendSubmission = await res.json();

  const statCards = [
    {
      label: "PnL",
      value: sub.score
        ? `${sub.score.pnl >= 0 ? "+" : ""}$${Math.abs(sub.score.pnl / 1000).toFixed(2)}k`
        : "—",
      color: sub.score
        ? sub.score.pnl >= 0
          ? "text-emerald-400"
          : "text-rose-400"
        : "text-slate-600",
    },
    {
      label: "Sharpe Ratio",
      value: sub.score ? sub.score.sharpe.toFixed(3) : "—",
      color: sub.score
        ? sub.score.sharpe >= 1
          ? "text-emerald-400"
          : sub.score.sharpe >= 0
          ? "text-slate-300"
          : "text-rose-400"
        : "text-slate-600",
    },
    {
      label: "Max Drawdown",
      value: sub.score ? `${(sub.score.max_drawdown * 100).toFixed(2)}%` : "—",
      color: sub.score ? "text-amber-400" : "text-slate-600",
    },
    {
      label: "Runtime",
      value: sub.runtime_seconds != null ? `${sub.runtime_seconds.toFixed(2)}s` : "—",
      color: "text-slate-300",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/submit"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Submit
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">
            Submission #{sub.id}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-mono break-all">
            {sub.filename}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Submitted {formatDate(sub.created_at)} · Team{" "}
            <span className="text-slate-400 font-mono">{sub.team_id}</span>
          </p>
        </div>
        <div className="shrink-0 mt-1">
          <StatusBadge status={sub.status} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 flex flex-col gap-1">
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className={`text-xl font-bold mono-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Logs
        </h2>

        {isFailed(sub.status) && sub.validation_error ? (
          <pre className="bg-slate-950 rounded-xl border border-rose-500/20 p-4 text-xs font-mono text-rose-300 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
            {sub.validation_error}
          </pre>
        ) : sub.status === "passed" ? (
          <div className="flex items-center gap-2.5 text-emerald-400 text-sm bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Strategy ran successfully with no errors.
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-slate-500 text-sm bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Logs will appear once the run completes.
          </div>
        )}
      </div>
    </div>
  );
}
