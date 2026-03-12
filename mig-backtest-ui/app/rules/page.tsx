"use client";

import { useState } from "react";
import Timeline from "@/components/competition/Timeline";
import { mockTimeline } from "@/lib/mockData";

const faqs = [
  {
    q: "Can I use machine learning in my strategy?",
    a: "No. Strategies must be purely algorithmic and deterministic. External models, neural networks, or LLM calls are not permitted. You may use scipy's statistical functions and sklearn preprocessing utilities.",
  },
  {
    q: "What data is available?",
    a: "You receive OHLCV (Open, High, Low, Close, Volume) data for 5 ETFs, plus 12 pre-computed technical features per asset per day. The full dataset spans 3 years (~750 trading days), but the backtest window is the most recent 251 trading days.",
  },
  {
    q: "How are transaction costs applied?",
    a: "5 basis points (0.05%) per unit traded, applied to the execution price. Costs are computed on the absolute change in position between days.",
  },
  {
    q: "What happens if my strategy throws an error?",
    a: "The submission is marked 'failed' and you receive an error message. It does not count against your daily submission limit if it fails during validation. Runtime errors during backtesting do count.",
  },
  {
    q: "Are positions marked-to-market daily?",
    a: "Yes. Your portfolio value is computed at the end of each trading day using closing prices. PnL is the cumulative change from the starting $25,000 cash.",
  },
  {
    q: "What is the difference between public and hidden scoring?",
    a: "The public leaderboard uses a known validation set (the same data you receive). The hidden finals use a separate out-of-sample test set. The same strategy code is evaluated — no resubmission is needed.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-slate-200 hover:text-slate-100 transition-colors cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm">{q}</span>
        <svg
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">Documentation</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">Competition Rules</h1>
        <p className="text-slate-400 leading-relaxed">
          Everything you need to know about the competition format, scoring, and submission requirements.
        </p>
      </div>

      {/* Overview */}
      <section className="glass-card rounded-2xl p-6 md:p-8 mb-8">
        <h2 className="text-slate-100 font-bold text-xl mb-4">Overview</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          The MIG Quant Competition is a <span className="text-slate-200 font-medium">multi-asset daily trading challenge</span>.
          Participants submit a Python strategy that allocates positions across 5 diversified ETFs each trading day.
          Strategies are backtested against historical data and ranked by risk-adjusted performance.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {[
            { label: "Starting Capital", value: "$25,000", color: "text-emerald-400" },
            { label: "Trading Assets", value: "5 ETFs", color: "text-sky-400" },
            { label: "Backtest Window", value: "251 Days", color: "text-violet-400" },
          ].map(({ label, value, color }, i) => (
            <div key={i} className="bg-slate-900/60 rounded-xl p-4 text-center">
              <p className={`mono-nums text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Pipeline Diagram */}
      <section className="glass-card rounded-2xl p-6 md:p-8 mb-8">
        <h2 className="text-slate-100 font-bold text-xl mb-6">Data Pipeline</h2>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 820 120" className="w-full min-w-[500px]" aria-label="Data pipeline diagram">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
            </defs>

            {/* Box 1: Market Data */}
            <rect x="0" y="35" width="140" height="50" rx="8" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="70" y="57" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="600">Market Data</text>
            <text x="70" y="74" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">OHLCV + Features</text>

            {/* Arrow 1 */}
            <line x1="142" y1="60" x2="166" y2="60" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Box 2: Strategy */}
            <rect x="168" y="35" width="140" height="50" rx="8" fill="#052e16" stroke="#10b981" strokeWidth="1.5" />
            <text x="238" y="57" textAnchor="middle" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="600">Your Strategy</text>
            <text x="238" y="74" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">get_actions(.py)</text>

            {/* Arrow 2 */}
            <line x1="310" y1="60" x2="334" y2="60" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Box 3: Backtester */}
            <rect x="336" y="35" width="140" height="50" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="406" y="57" textAnchor="middle" fill="#818cf8" fontSize="11" fontFamily="monospace" fontWeight="600">Backtester</text>
            <text x="406" y="74" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">Portfolio Engine</text>

            {/* Arrow 3 */}
            <line x1="478" y1="60" x2="502" y2="60" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Box 4: Metrics */}
            <rect x="504" y="35" width="140" height="50" rx="8" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="574" y="57" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="600">Risk Metrics</text>
            <text x="574" y="74" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">PnL · Sharpe · DD</text>

            {/* Arrow 4 */}
            <line x1="646" y1="60" x2="670" y2="60" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Box 5: Leaderboard */}
            <rect x="672" y="35" width="140" height="50" rx="8" fill="#052e16" stroke="#10b981" strokeWidth="1.5" />
            <text x="742" y="57" textAnchor="middle" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="600">Leaderboard</text>
            <text x="742" y="74" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">Public Rankings</text>
          </svg>
        </div>
      </section>

      {/* Scoring */}
      <section className="glass-card rounded-2xl p-6 md:p-8 mb-8">
        <h2 className="text-slate-100 font-bold text-xl mb-6">Scoring Criteria</h2>
        <div className="flex flex-col gap-5">
          {[
            {
              rank: "1st",
              label: "Final PnL",
              desc: "Cumulative profit and loss from $25,000 starting capital, net of transaction costs.",
              color: "border-emerald-500",
              textColor: "text-emerald-400",
              bg: "bg-emerald-500/5",
            },
            {
              rank: "2nd",
              label: "Sharpe Ratio",
              desc: "Annualized Sharpe ratio: mean daily return divided by standard deviation × √252. Tiebreaker when PnL is identical.",
              color: "border-sky-500",
              textColor: "text-sky-400",
              bg: "bg-sky-500/5",
            },
            {
              rank: "3rd",
              label: "Max Drawdown",
              desc: "Maximum peak-to-trough decline in portfolio value. Lower (less negative) is better. Third tiebreaker.",
              color: "border-amber-500",
              textColor: "text-amber-400",
              bg: "bg-amber-500/5",
            },
          ].map(({ rank, label, desc, color, textColor, bg }, i) => (
            <div key={i} className={`rounded-xl p-4 border-l-4 ${color} ${bg} flex gap-4`}>
              <div className={`font-mono text-2xl font-bold ${textColor} shrink-0`}>{rank}</div>
              <div>
                <p className="text-slate-200 font-semibold mb-1">{label}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trading Constraints */}
      <section className="glass-card rounded-2xl p-6 md:p-8 mb-8">
        <h2 className="text-slate-100 font-bold text-xl mb-5">Trading Constraints</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { constraint: "Position Limit", value: "±100 units per asset", note: "Violations result in disqualification" },
            { constraint: "Transaction Cost", value: "5 bps per trade", note: "Applied to absolute position change" },
            { constraint: "Short Selling", value: "Permitted", note: "Negative positions allowed within limits" },
            { constraint: "Leverage", value: "Max 2×", note: "Gross position cannot exceed 2× capital" },
            { constraint: "Runtime Limit", value: "30 seconds", note: "Strategies exceeding this are failed" },
            { constraint: "Memory Limit", value: "512 MB", note: "Peak memory usage during backtest" },
          ].map(({ constraint, value, note }, i) => (
            <div key={i} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
              <p className="text-slate-500 text-xs mb-1">{constraint}</p>
              <p className="text-slate-200 font-semibold mono-nums">{value}</p>
              <p className="text-slate-600 text-xs mt-1">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-8">
        <h2 className="text-slate-100 font-bold text-xl mb-6">Competition Timeline</h2>
        <Timeline events={mockTimeline} />
      </section>

      {/* FAQ */}
      <section className="glass-card rounded-2xl p-6 md:p-8 mb-8">
        <h2 className="text-slate-100 font-bold text-xl mb-2">Frequently Asked Questions</h2>
        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>
    </div>
  );
}
