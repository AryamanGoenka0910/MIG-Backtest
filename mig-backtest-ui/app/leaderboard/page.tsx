"use client";

import MetricCard from "@/components/ui/MetricCard";
import PodiumCards from "@/components/leaderboard/PodiumCards";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import Tabs from "@/components/ui/Tabs";
import { mockTeams, mockLeaderboardStats } from "@/lib/mockData";

export default function LeaderboardPage() {
  const stats = mockLeaderboardStats;
  const teams = mockTeams;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">Rankings</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Leaderboard</h1>
            <p className="text-slate-500 mt-2">
              Public validation results · {stats.activePeriod}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-500 mono-nums">Last updated: March 12, 2026 at 08:00 EST</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard
          label="Teams Registered"
          value={String(stats.totalTeams)}
          subLabel="across 18 universities"
          glowColor="emerald"
        />
        <MetricCard
          label="Total Submissions"
          value={String(stats.totalSubmissions)}
          trend="up"
          trendValue="+12 today"
        />
        <MetricCard
          label="Leading PnL"
          value={`$${(stats.topPnl / 1000).toFixed(1)}k`}
          subLabel="AlphaSignal"
          glowColor="emerald"
        />
        <MetricCard
          label="Best Sharpe"
          value={stats.topSharpe.toFixed(2)}
          subLabel="AlphaSignal"
          glowColor="sky"
        />
      </div>

      {/* Podium */}
      <div className="mb-10">
        <h2 className="text-sm font-mono uppercase tracking-widest text-slate-500 mb-5">Top 3</h2>
        <PodiumCards teams={teams} />
      </div>

      {/* Tabs: Public vs Final */}
      <Tabs
        tabs={[
          { id: "public", label: "Public Leaderboard", count: teams.length },
          {
            id: "final",
            label: "Final Results",
            disabled: true,
            lockedLabel: "Final results will be revealed on March 28, 2026",
          },
        ]}
        defaultTab="public"
      >
        {(activeTab) =>
          activeTab === "public" ? (
            <LeaderboardTable teams={teams} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mb-4">
                🔒
              </div>
              <h3 className="text-slate-300 font-semibold text-lg mb-2">Final Results Locked</h3>
              <p className="text-slate-500 max-w-sm">
                Final rankings will be revealed on <span className="text-slate-300 font-medium">March 28, 2026</span> after
                evaluation on the hidden out-of-sample dataset.
              </p>
            </div>
          )
        }
      </Tabs>
    </div>
  );
}
