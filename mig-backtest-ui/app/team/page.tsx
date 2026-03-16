"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import MetricCard from "@/components/ui/MetricCard";
import SubmissionHistory from "@/components/submission/SubmissionHistory";

import { createClient } from "@/lib/supabase/client";
import type { Submission } from "@/lib/types/submissions";
import type { TeamMember } from "@/lib/types/team";
import { getTeamSubmissions, getDailyCount } from "@/lib/api/submissions";


export default function TeamPage() {
  const router = useRouter();

  const [userName, setUserName] = useState<string>("—");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dailyCount, setDailyCount] = useState({ count: 0, limit: 5 });
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [teamLoading, setTeamLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("Users")
        .select("team_id, user_name")
        .eq("user_id", user.id)
        .single();

      const resolvedTeamId = (profile?.team_id as string | undefined) ?? user.id;
      setUserName((profile?.user_name as string | undefined) ?? "Unknown");

      const [teamRes, submissionsRes, dailyRes] = await Promise.allSettled([
        fetch("/api/team"),
        getTeamSubmissions(resolvedTeamId).catch(() => []),
        getDailyCount(resolvedTeamId).catch(() => ({ count: 0, limit: 5, team_id: resolvedTeamId })),
      ]);

      if (teamRes.status === "fulfilled" && teamRes.value.ok) {
        const json = await teamRes.value.json();
        setMembers(json.team?.members ?? []);
      }
      setTeamLoading(false);

      if (submissionsRes.status === "fulfilled") {
        setSubmissions(submissionsRes.value);
      }
      if (dailyRes.status === "fulfilled") {
        setDailyCount(dailyRes.value);
      }
      setSubmissionsLoading(false);
    };

    load();
  }, [router]);

  const best = submissions
    .filter((s) => s.status === "passed" && s.score)
    .sort((a, b) => (b.score?.pnl ?? 0) - (a.score?.pnl ?? 0))[0];

  const pnl = best?.score?.pnl ?? null;
  const sharpe = best?.score?.sharpe ?? null;
  const drawdown = best?.score?.max_drawdown ?? null;
  const submissionsLeft = dailyCount.limit - dailyCount.count;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-1">Team Dashboard</p>
          {teamLoading ? (
            <div className="h-9 w-40 bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">{userName}</h1>
          )}
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition-colors shadow-[0_0_16px_rgba(16,185,129,0.2)] self-start sm:self-auto shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Submit Strategy
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Best PnL"
          value={submissionsLoading ? "…" : pnl !== null ? `${pnl >= 0 ? "+" : ""}$${(pnl / 1000).toFixed(1)}k` : "—"}
          subLabel={submissionsLoading ? "" : pnl !== null ? "vs $25k starting" : "no results yet"}
          glowColor={pnl !== null && pnl >= 0 ? "emerald" : pnl !== null ? "rose" : "sky"}
          valueColor={pnl !== null ? (pnl >= 0 ? "emerald" : "rose") : "default"}
        />
        <MetricCard
          label="Best Sharpe"
          value={submissionsLoading ? "…" : sharpe !== null ? sharpe.toFixed(2) : "—"}
          subLabel={submissionsLoading ? "" : sharpe !== null ? "annualised" : "no results yet"}
          glowColor="sky"
        />
        <MetricCard
          label="Max Drawdown"
          value={submissionsLoading ? "…" : drawdown !== null ? `${(drawdown * 100).toFixed(1)}%` : "—"}
          subLabel={submissionsLoading ? "" : drawdown !== null ? "peak to trough" : "no results yet"}
          glowColor="sky"
        />
        <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
          <span className="text-slate-400 text-sm font-medium">Today&apos;s Submissions</span>
          {submissionsLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
          ) : (
            <span className="mono-nums text-2xl font-semibold text-slate-100 leading-none">
              {dailyCount.count}
              <span className="text-slate-600 text-base font-normal"> / {dailyCount.limit}</span>
            </span>
          )}
          <div className="flex gap-1.5">
            {Array.from({ length: dailyCount.limit }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${submissionsLoading ? "bg-slate-800 animate-pulse" : i < dailyCount.count ? "bg-emerald-500" : "bg-slate-800"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Submission History + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-slate-200 font-semibold text-lg mb-4">Team Submission History</h2>
          {submissionsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl h-14 animate-pulse bg-slate-800/50" />
              ))}
            </div>
          ) : (
            <SubmissionHistory submissions={submissions} />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-sky-500/50">
            <h3 className="text-slate-200 font-semibold mb-3 text-sm">Competition Reminders</h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-500">
              {[
                "Deadline: March 20 at 11:59 AM EST",
                `${submissionsLeft} submission${submissionsLeft === 1 ? "" : "s"} remaining today`,
                "Public finals: March 15–20",
                "Awards ceremony: March 20",
              ].map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-400 mt-0.5">›</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Team Members */}
          {teamLoading ? (
            <div className="glass-card rounded-2xl p-6">
              <div className="h-3 w-24 bg-slate-800 rounded animate-pulse mb-4" />
              <div className="flex flex-wrap gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 w-32 bg-slate-800/60 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : members.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-4">Team Members</h2>
              <div className="flex flex-wrap gap-3">
                {members.map((m) => {
                  const initial = (m.user_name ?? m.user_id).charAt(0).toUpperCase();
                  const isCurrentUser = m.user_id === currentUserId;
                  return (
                    <div
                      key={m.user_id}
                      className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold text-sm shrink-0">
                        {initial}
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium leading-none">
                          {m.user_name ?? "Unnamed"}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-emerald-400 font-mono">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
