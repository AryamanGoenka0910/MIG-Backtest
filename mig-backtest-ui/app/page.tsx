import Link from "next/link";
import HowItWorks from "@/components/landing/HowItWorks";
import SponsorStrip from "@/components/landing/SponsorStrip";
import type { Sponsor } from "@/types";

const sponsors: Sponsor[] = [
  { name: "IMC Trading",  tier: "gold",     logoPlaceholder: "IMC Trading" },
  { name: "Jane Street",  tier: "silver",   logoPlaceholder: "Jane Street" },
  { name: "Citadel",      tier: "silver",   logoPlaceholder: "Citadel" },
  { name: "Old Mission",  tier: "silver",   logoPlaceholder: "Old Mission" },
  { name: "Optiver",      tier: "silver",   logoPlaceholder: "Optiver" },
  { name: "5 Rings",      tier: "bronze",   logoPlaceholder: "5 Rings" },
  { name: "HRT",          tier: "bronze",   logoPlaceholder: "HRT" },
];

export default function HomePage() {

  return (
    <div className="bg-grid-pattern">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-mono tracking-wider uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MIG Quant Conference 2026 · Submissions Open
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            <span className="gradient-text">MIG Quant</span>
            <br />
            <span className="text-slate-100">Algo Challenge</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            The Michigan Investment Group&apos;s algorithmic trading challenge.
            Build a data-driven strategy. Backtest against real market data.
            Compete against the best minds in university finance.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-base hover:bg-emerald-400 transition-colors duration-150 shadow-[0_0_24px_rgba(16,185,129,0.3)]"
            >
              Submit Your Strategy
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            {/* <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-base hover:border-slate-600 hover:bg-slate-800/40 transition-colors duration-150"
            >
              View Leaderboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Link> */}
          </div>

          {/* Scroll hint */}
          <div className="mt-16 flex justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-700 animate-bounce">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Competition structure callout */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-3">Scoring Structure</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
                Public Leaderboard.<br />
                <span className="text-slate-400">Hidden Finals.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                During the submission window, your strategy is evaluated on a <span className="text-slate-200 font-medium">public validation dataset</span>.
                Rankings are visible to everyone — use them to iterate and improve.
              </p>
              <p className="text-slate-400 leading-relaxed">
                After the deadline, every qualifying strategy is re-evaluated on a <span className="text-slate-200 font-medium">hidden out-of-sample dataset</span>.
                Final rankings are determined solely by hidden-set performance. Overfitting is penalized.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  phase: "Public Testing",
                  desc: "Test and develop with your public dataset",
                  color: "border-l-4 border-emerald-500 pl-4",
                  tag: "Live Now",
                  tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                },
                {
                  phase: "Public Finals",
                  desc: "Out-of-sample evaluation to generatle our leaderboard.",
                  color: "border-l-4 border-slate-600 pl-4",
                  tag: "Mar 15-20",
                  tagColor: "bg-slate-800 text-slate-500 border-slate-700",
                },
                {
                  phase: "Awards Ceremony",
                  desc: "Final hidden dataset to evaluate the final winners",
                  color: "border-l-4 border-amber-600/50 pl-4",
                  tag: "Mar 20",
                  tagColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                },
              ].map((item, i) => (
                <div key={i} className={`${item.color} py-1`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-200 font-semibold text-sm">{item.phase}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${item.tagColor}`}>{item.tag}</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <SponsorStrip sponsors={sponsors} />
    </div>
  );
}
