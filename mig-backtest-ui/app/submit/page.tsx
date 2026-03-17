"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UploadDropzone from "@/components/submission/UploadDropzone";
import SubmissionHistory from "@/components/submission/SubmissionHistory";
import { getTeamSubmissions, getDailyCount } from "@/lib/api/submissions";
import type { Submission } from "@/lib/types/submissions";

export default function SubmitPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dailyCount, setDailyCount] = useState({ count: 0, limit: 5 });
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("Users")
        .select("team_id")
        .eq("user_id", user.id)
        .single();

      const resolvedTeamId = (profile?.team_id as string | undefined) ?? user.id;
      setTeamId(resolvedTeamId);

      const [submissionsRes, dailyRes] = await Promise.allSettled([
        getTeamSubmissions(resolvedTeamId).catch(() => []),
        getDailyCount(resolvedTeamId).catch(() => ({ count: 0, limit: 5, team_id: resolvedTeamId })),
      ]);

      if (submissionsRes.status === "fulfilled") setSubmissions(submissionsRes.value);
      if (dailyRes.status === "fulfilled") setDailyCount(dailyRes.value);
      setSubmissionsLoading(false);
    };

    load();
  }, [router]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-emerald-600 dark:text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">Upload</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Submit Strategy</h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-slate-500">Upload your Python strategy file for evaluation.</p>
          <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono shrink-0">
            Deadline: Mar 20 · 11:59 AM EST
          </span>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Submission Rules */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-slate-800 dark:text-slate-200 font-semibold mb-3 flex items-center gap-2 text-sm">
            <span className="text-amber-400">⚠</span> Submission Rules
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
            {[
              { icon: "📁", text: ".py (1 MB) or .zip bundle (10 MB)" },
              { icon: "🔢", text: "Max 5 submissions per day" },
              { icon: "⏱", text: "Runtime limit: 60 seconds" },
              { icon: "💾", text: "Memory limit: 512 MB" },
              { icon: "🌐", text: "No network or file I/O in sandbox" },
              { icon: "📦", text: "numpy, pandas, scipy, sklearn, statsmodels, ta-lib, numba, joblib" },
            ].map(({ icon, text }, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Required Interface */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-slate-800 dark:text-slate-200 font-semibold mb-2 text-sm">Required Interface</h3>
          <p className="text-slate-500 text-xs mb-3">Your file must define this function:</p>
          <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed overflow-x-auto">
            <span className="text-violet-500 dark:text-violet-400">import</span>{" "}
            <span className="text-slate-700 dark:text-slate-300">numpy</span>{" "}
            <span className="text-violet-500 dark:text-violet-400">as</span>{" "}
            <span className="text-slate-700 dark:text-slate-300">np</span>
            <br /><br />
            <span className="text-sky-500 dark:text-sky-400">def</span>{" "}
            <span className="text-emerald-600 dark:text-emerald-400">get_actions</span>
            <span className="text-slate-700 dark:text-slate-300">(</span>
            <span className="text-amber-600 dark:text-amber-300">prices</span>
            <span className="text-slate-500">: np.ndarray</span>
            <span className="text-slate-700 dark:text-slate-300">)</span>
            <span className="text-slate-500"> -{">"} np.ndarray</span>
            <span className="text-slate-700 dark:text-slate-300">:</span>
            <br />
            <span className="text-slate-400 dark:text-slate-600 ml-4"># prices: (num_stocks, num_days)</span>
            <br />
            <span className="text-slate-400 dark:text-slate-600 ml-4"># return: same shape — shares traded</span>
            <br />
            <span className="text-slate-400 dark:text-slate-600 ml-4"># +N buy · -N sell/short · 0 hold</span>
            <br />
            <span className="text-slate-400 dark:text-slate-600 ml-4">...</span>
          </div>
        </div>

        {/* Scoring */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-slate-800 dark:text-slate-200 font-semibold mb-3 text-sm">How Scoring Works</h3>
          <div className="flex flex-col gap-3 text-sm">
            {[
              { rank: "Primary", metric: "Final PnL", color: "text-emerald-400" },
              { rank: "Secondary", metric: "Sharpe Ratio", color: "text-sky-400" },
              { rank: "Tertiary", metric: "Max Drawdown", color: "text-amber-400" },
            ].map(({ rank, metric, color }, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">{rank}</span>
                <span className={`font-medium ${color}`}>{metric}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
              Starting capital: $25,000 · 30 stocks
            </div>
          </div>
        </div>
      </div>

      {/* Upload + Submissions Used */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-slate-800 dark:text-slate-200 font-semibold text-lg mb-5">Upload Strategy File</h2>
          {userId && teamId ? (
            <UploadDropzone userId={userId} teamId={teamId} maxSizeMB={1} />
          ) : (
            <div className="h-40 rounded-xl bg-slate-200/80 dark:bg-slate-800/50 animate-pulse" />
          )}
        </div>

        {/* Submissions Used */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Submissions Used</p>
          {submissionsLoading ? (
            <div className="h-12 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-5xl font-bold text-slate-900 dark:text-slate-100 mono-nums">{dailyCount.count}</p>
          )}
          <p className="text-slate-600 text-sm font-mono">/ {dailyCount.limit} today</p>
          <div className="flex gap-1.5 mt-2">
            {Array.from({ length: dailyCount.limit }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full ${submissionsLoading ? "bg-slate-200 dark:bg-slate-800 animate-pulse" : i < dailyCount.count ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Submission History */}
      <div>
        <h2 className="text-slate-800 dark:text-slate-200 font-semibold text-lg mb-4">Team Submission History</h2>
        {submissionsLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl h-14 animate-pulse bg-slate-200/80 dark:bg-slate-800/50" />
            ))}
          </div>
        ) : (
          <SubmissionHistory submissions={submissions} />
        )}
      </div>
    </div>
  );
}
