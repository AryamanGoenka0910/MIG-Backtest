"use client";

import MetricCard from "@/components/ui/MetricCard";
import PerformanceChart from "@/components/charts/PerformanceChart";
import SubmissionHistory from "@/components/submission/SubmissionHistory";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";
import { mockTeams, mockSubmissions } from "@/lib/mockData";

// Mock: viewing AlphaSignal as "your" team
const myTeam = mockTeams[0];
const mySubmissions = mockSubmissions.filter(s => s.teamId === "team-001");

const chartData = myTeam.sparklineData.map((value, i) => ({
  day: i + 1,
  value,
}));

export default function TeamPage() {
  const pnlChange = myTeam.pnl - 25000;
  const pnlPct = ((pnlChange / 25000) * 100).toFixed(1);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Team header */}
      <div className="glass-card rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-3xl font-bold text-amber-400">#1</span>
            <h1 className="text-2xl font-bold text-slate-100">{myTeam.name}</h1>
            <StatusBadge status={myTeam.status} />
          </div>
          <p className="text-slate-500">{myTeam.school}</p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition-colors shadow-[0_0_16px_rgba(16,185,129,0.2)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Submit New Strategy
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Current Rank"
          value={`#${myTeam.rank}`}
          subLabel={`Top 6% of ${18} teams`}
          glowColor="emerald"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <MetricCard
          label="Total PnL"
          value={`+$${(myTeam.pnl / 1000).toFixed(1)}k`}
          trendValue={`+${pnlPct}%`}
          trend="up"
          subLabel="vs $25k starting"
          sparkline={myTeam.sparklineData}
          glowColor="emerald"
        />
        <MetricCard
          label="Sharpe Ratio"
          value={myTeam.sharpe.toFixed(2)}
          subLabel="risk-adjusted return"
          glowColor="sky"
        />
        <MetricCard
          label="Max Drawdown"
          value={`${(myTeam.maxDrawdown * 100).toFixed(1)}%`}
          subLabel="max peak-to-trough"
          trend="neutral"
        />
      </div>

      {/* Performance chart */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-200 font-semibold text-lg">Portfolio Performance</h2>
          <span className="text-xs font-mono text-slate-500">Public validation dataset · 15-day window</span>
        </div>
        <PerformanceChart
          data={chartData}
          teamName={myTeam.name}
          height={280}
        />
      </div>

      {/* Two columns: history + tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-slate-200 font-semibold text-lg mb-4">Submission History</h2>
          <SubmissionHistory submissions={mySubmissions} />
        </div>

        <div className="flex flex-col gap-4">
          {/* Competition reminders */}
          <div className="glass-card rounded-2xl p-5 border-l-4 border-sky-500/50">
            <h3 className="text-slate-200 font-semibold mb-3 text-sm">Competition Reminders</h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-500">
              {[
                "Deadline: March 20 at 11:59 PM EST",
                "5 submissions remaining today",
                "Hidden finals: March 21–27",
                "Awards ceremony: April 5",
              ].map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-400 mt-0.5">›</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Strategy tips */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-slate-200 font-semibold mb-3 text-sm">Tips to Improve Your Score</h3>
            <ul className="flex flex-col gap-3 text-xs text-slate-500">
              {[
                {
                  tip: "Reduce turnover",
                  detail: "Each trade costs 5bps. High-frequency strategies are penalized.",
                },
                {
                  tip: "Diversify across ETFs",
                  detail: "Correlated positions increase drawdown without improving PnL.",
                },
                {
                  tip: "Normalize your signals",
                  detail: "z-score your features before generating positions.",
                },
                {
                  tip: "Limit position size",
                  detail: "Hard limit is ±100 units. Strategies that hit it often are disqualified.",
                },
              ].map(({ tip, detail }, i) => (
                <li key={i} className="border-l-2 border-slate-800 pl-3">
                  <p className="text-slate-300 font-medium mb-0.5">{tip}</p>
                  <p>{detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
