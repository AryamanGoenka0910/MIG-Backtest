const steps = [
  {
    number: "01",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Register Your Team",
    description: "Sign up with your team name and school. Up to 3 members per team. Starter code and documentation released on registration.",
    accentColor: "text-sky-400",
    borderColor: "border-sky-500/20",
    bgColor: "bg-sky-500/5",
  },
  {
    number: "02",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: "Download Market Data",
    description: "Access 3 years of historical OHLCV data + pre-engineered signals for 5 diversified ETFs. Data provided as NumPy arrays.",
    accentColor: "text-violet-400",
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
  },
  {
    number: "03",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: "Code Your Strategy",
    description: "Implement get_actions(prices) → positions in Python. Use numpy, pandas, scipy. Position limits enforced. Transaction costs apply.",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/5",
  },
  {
    number: "04",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Submit & Compete",
    description: "Upload your .py file. Backtesting runs automatically. Results appear on the public leaderboard within minutes. Top strategies advance to hidden finals.",
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/5",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-emerald-400 text-sm font-mono font-medium tracking-widest uppercase mb-3">Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">How It Works</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            From registration to the podium — four straightforward steps to compete.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className={`glass-card rounded-xl p-6 flex flex-col gap-4 hover:border-slate-700/60 transition-colors duration-200`}>
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${step.bgColor} border ${step.borderColor}`}>
                  <div className={step.accentColor}>{step.icon}</div>
                </div>
                <span className={`font-mono text-3xl font-bold opacity-20 ${step.accentColor}`}>{step.number}</span>
              </div>
              <div>
                <h3 className="text-slate-100 font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
