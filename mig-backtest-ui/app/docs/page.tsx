"use client";

import { useState } from "react";
import Link from "next/link";

function CodeBlock({ code, lang = "python" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-mono text-slate-500">{lang}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="text-slate-700 dark:text-slate-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      {children}
    </section>
  );
}

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quick Start" },
  { id: "strategy-interface", label: "Strategy Interface" },
  { id: "data-format", label: "Data Format" },
  { id: "submission-format", label: "Submission Format" },
  { id: "packages", label: "Available Packages" },
  { id: "backtester", label: "Backtester Mechanics" },
  { id: "scoring", label: "Scoring" },
  { id: "constraints", label: "Constraints" },
  { id: "rules", label: "Rules & Integrity" },
  { id: "sample", label: "Sample Repo" },
];

const STRATEGY_CODE = `import numpy as np

def get_actions(prices: np.ndarray) -> np.ndarray:
    """
    Arguments:
        prices  -- np.ndarray of shape (num_stocks, num_days)
                   Contains the Open price for each stock on each day.
                   Rows = stocks (sorted by ticker), Columns = days.

    Returns:
        actions -- np.ndarray of the same shape (num_stocks, num_days).
                   Each value is the number of shares TRADED on that day.
                   +N = buy N shares
                   -N = sell / open short N shares
                    0 = hold (no trade)
    """
    num_stocks, num_days = prices.shape
    actions = np.zeros_like(prices)

    # Example: 5/20-day moving average crossover
    short_window, long_window = 5, 20
    for i in range(num_stocks):
        position = 0
        for t in range(long_window, num_days):
            short_ma = prices[i, t - short_window:t].mean()
            long_ma  = prices[i, t - long_window:t].mean()
            if short_ma > long_ma and position == 0:
                actions[i, t] = 1   # buy 1 share
                position = 1
            elif short_ma <= long_ma and position == 1:
                actions[i, t] = -1  # sell 1 share
                position = 0

    return actions`;

const ZIP_STRUCTURE = `my_strategy.zip
├── strategy.py          # must contain get_actions()
└── model_weights.pkl    # ml model weights (optional)`;

const BACKTESTER_EXAMPLE = `# How the backtester processes your actions
# 2 stocks, 5 days — shape: (num_stocks, num_days)

prices = np.array([
    [100, 102, 105, 103, 108],   # stock 0
    [ 50,  49,  51,  52,  48],   # stock 1
])

actions = np.array([
    [  5,   0,   0,  -5,   0],   # buy 5 shares of stock 0 on day 0, sell all on day 3
    [  0,  -3,   0,   0,   3],   # short 3 shares of stock 1 on day 1, cover on day 4
])

# Starting cash: $25,000
# Fractional shares are NOT supported (values are rounded to int)
# Short positions are closed FIFO`;

const SHARPE_FORMULA = `# Annualised Sharpe Ratio (computed by the backtester)
daily_returns = np.diff(portfolio_values) / portfolio_values[:-1]
sharpe = np.sqrt(252) * daily_returns.mean() / daily_returns.std(ddof=1)`;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">On this page</p>
            <nav className="flex flex-col gap-0.5">
              {SIDEBAR_ITEMS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setActiveSection(id)}
                  className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                    activeSection === id
                      ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-10">
          {/* Header */}
          <div>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">Developer Docs</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">Documentation</h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Everything you need to write, test, and submit a trading strategy for the MIG Quant Competition.
            </p>
          </div>

          {/* Overview */}
          <Section id="overview">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-4">Overview</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                You submit a single Python file (or a <code className="text-sky-400 font-mono text-sm">.zip</code> bundle) containing a
                function called <code className="text-emerald-400 font-mono text-sm">get_actions</code>. The backtester feeds your function
                historical Open prices for all stocks and expects back a matrix of share quantities to trade each day.
                Strategies are ranked by <span className="text-slate-900 dark:text-slate-200 font-medium">Final PnL</span>, with Sharpe Ratio and Max
                Drawdown as tiebreakers.{" "}
                <span className="text-emerald-400 font-medium">Machine learning and technical indicators are fully encouraged</span>
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Starting Capital", value: "$25,000", color: "text-emerald-400" },
                  { label: "Stocks in Universe", value: "30", color: "text-sky-400" },
                  { label: "Daily Limit", value: "5 Submissions", color: "text-amber-400" },
                ].map(({ label, value, color }, i) => (
                  <div key={i} className="bg-slate-100 dark:bg-slate-900/60 rounded-xl p-4 text-center">
                    <p className={`mono-nums text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-slate-500 text-xs mt-1 dark:text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Quick Start */}
          <Section id="quickstart">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-2">Quick Start</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Get a working strategy submitted in under 5 minutes.
              </p>
              <ol className="flex flex-col gap-6">
                {[
                  {
                    step: "01",
                    title: "Download the sample repo",
                    body: (
                      <>
                        Grab the <code className="text-sky-400 font-mono text-sm">sample/</code> folder from the repository — it includes the training
                        dataset, a working example strategy, and two Jupyter notebooks to get you started.
                        <div className="mt-3 flex items-center gap-4">
                          <a
                            href="https://github.com/AryamanGoenka0910/mig-quant-conference-2026-sample/tree/main"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
                          >
                            Open on GitHub ↗
                          </a>
                          <Link
                            href="#sample"
                            className="inline-flex items-center gap-1.5 text-slate-500 text-sm hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                          >
                            Jump to Sample Repo →
                          </Link>
                        </div>
                      </>
                    ),
                  },
                  {
                    step: "02",
                    title: "Write your get_actions function",
                    body: "Open sample_strategy.py and modify the get_actions function. It receives prices as a (num_stocks × num_days) matrix and must return an actions matrix of the same shape.",
                  },
                  {
                    step: "03",
                    title: "Test locally with the backtester",
                    body: (
                      <>
                        Run the included <code className="text-sky-400 font-mono text-sm">02_strategy_development.ipynb</code> notebook to
                        simulate your strategy against the training data before submitting.
                      </>
                    ),
                  },
                  {
                    step: "04",
                    title: "Submit your .py file",
                    body: (
                      <>
                        Upload your strategy on the{" "}
                        <Link href="/submit" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
                          Submit
                        </Link>{" "}
                        page. You can submit up to 5 times per day. Only your highest-scoring submission counts.
                      </>
                    ),
                  },
                ].map(({ step, title, body }) => (
                  <li key={step} className="flex gap-4">
                    <span className="font-mono text-2xl font-bold text-slate-400 dark:text-slate-700 shrink-0 w-8">{step}</span>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold mb-1">{title}</p>
                      <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Section>

          {/* Strategy Interface */}
          <Section id="strategy-interface">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-2">Strategy Interface</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed">
                Your file must define exactly one top-level function:{" "}
                <code className="text-emerald-400 font-mono">get_actions(prices)</code>. The signature and return type must match exactly.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    tag: "Input",
                    name: "prices",
                    type: "np.ndarray",
                    shape: "(num_stocks, num_days)",
                    desc: "Open price for each stock on each trading day. Rows are stocks (sorted alphabetically by ticker), columns are days in chronological order.",
                    color: "border-sky-500 bg-sky-500/5",
                    tagColor: "text-sky-400",
                  },
                  {
                    tag: "Output",
                    name: "actions",
                    type: "np.ndarray",
                    shape: "(num_stocks, num_days)",
                    desc: "Number of shares to trade per stock per day. Positive = buy, negative = sell/short, zero = hold. Must match the shape of the input exactly. Fractional values are rounded to integers.",
                    color: "border-emerald-500 bg-emerald-500/5",
                    tagColor: "text-emerald-400",
                  },
                ].map(({ tag, name, type, shape, desc, color, tagColor }) => (
                  <div key={tag} className={`rounded-xl p-4 border-l-4 ${color}`}>
                    <span className={`text-xs font-mono ${tagColor} uppercase tracking-widest`}>{tag}</span>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold font-mono mt-1">
                      {name}{" "}
                      <span className="text-slate-500 font-normal text-xs">
                        {type} · {shape}
                      </span>
                    </p>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <CodeBlock code={STRATEGY_CODE} lang="python — sample_strategy.py" />

              <div className="mt-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 mb-4">
                <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-1">ML &amp; Technical Indicators Encouraged</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  You are free to use machine learning models, statistical methods, and technical indicators inside{" "}
                  <code className="font-mono text-slate-600 dark:text-slate-300">get_actions</code>.{" "}
                  <code className="font-mono text-slate-600 dark:text-slate-300">scikit-learn</code>,{" "}
                  <code className="font-mono text-slate-600 dark:text-slate-300">statsmodels</code>, and{" "}
                  <code className="font-mono text-slate-600 dark:text-slate-300">ta-lib</code> (RSI, MACD, Bollinger Bands, etc.) are all pre-installed.
                  You can also bundle pre-trained model weights (e.g. a <code className="font-mono text-slate-600 dark:text-slate-300">.pkl</code> file) inside a{" "}
                  <code className="font-mono text-slate-600 dark:text-slate-300">.zip</code> submission and load them at runtime.
                </p>
              </div>

              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                <p className="text-amber-400 text-xs font-mono uppercase tracking-widest mb-1">Requirements</p>
                <ul className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-1 list-disc list-inside">
                  <li>The function name must be exactly <code className="font-mono text-slate-600 dark:text-slate-300">get_actions</code> — no aliases.</li>
                  <li>You may import any package listed in the Available Packages section.</li>
                  <li>No network access is permitted inside the sandbox.</li>
                  <li>No file I/O at arbitrary paths — access only files bundled in your <code className="font-mono text-slate-600 dark:text-slate-300">.zip</code>.</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Data Format */}
          <Section id="data-format">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-2">Data Format</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed">
                The training dataset (<code className="text-sky-400 font-mono text-sm">dev_data.csv</code>) contains OHLCV data for
                50 stocks. Your strategy only receives the Open price column as its input.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { col: "Ticker", type: "str", example: "ZJ", desc: "Stock symbol. Rows in the prices matrix are sorted alphabetically by ticker." },
                  { col: "Date", type: "date", example: "2015-07-06", desc: "Trading date in YYYY-MM-DD format. Columns in the prices matrix run chronologically." },
                  { col: "Open", type: "float", example: "5.6995", desc: "Daily open price. This is the only column passed to get_actions." },
                  { col: "High / Low", type: "float", example: "5.7583 / 5.6954", desc: "Intraday high and low. Available in dev_data.csv for research; not passed to your strategy." },
                  { col: "Close", type: "float", example: "5.7478", desc: "Daily closing price. Available for research; not passed to your strategy." },
                  { col: "Volume", type: "int", example: "112,241,600", desc: "Total shares traded that day. Available for research; not passed to your strategy." },
                ].map(({ col, type, example, desc }) => (
                  <div key={col} className="bg-slate-100/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold text-sm">{col}</span>
                      <span className="text-slate-600 text-xs font-mono">{type}</span>
                    </div>
                    <p className="text-emerald-400 font-mono text-xs mb-2">{example}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-sky-500/5 border border-sky-500/20 p-4">
                <p className="text-sky-400 text-xs font-mono uppercase tracking-widest mb-2">Data Shape in Your Strategy</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  <code className="font-mono text-slate-600 dark:text-slate-300">prices.shape == (30, num_days)</code> — 30 rows (one per stock, alphabetical),
                  columns are trading days in chronological order
                </p>
              </div>
            </div>
          </Section>

          {/* Submission Format */}
          <Section id="submission-format">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-2">Submission Format</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Two submission types are accepted.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-slate-100/80 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      .py
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">Single Python file</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed mb-3">
                    Upload a single <code className="font-mono text-slate-600 dark:text-slate-300">.py</code> file that imports only packages from the allowed
                    list and defines <code className="font-mono text-slate-600 dark:text-slate-300">get_actions</code>.
                  </p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs">Max size: 1 MB</p>
                </div>
                <div className="bg-slate-100/80 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      .zip
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">Zip bundle</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed mb-3">
                    If your strategy needs model weights for a pre-trained ML model (that you have trained locally), you can uploade at most one
                    <code className="font-mono text-slate-600 dark:text-slate-300">.pkl,.joblib,.npy,.npz</code> in the zip.
                  </p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs">Max size: 10 MB</p>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-slate-500 text-xs mb-2 font-mono">Expected zip structure</p>
                <CodeBlock code={ZIP_STRUCTURE} lang="shell" />
              </div>
            </div>
          </Section>

          {/* Available Packages */}
          <Section id="packages">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-2">Available Packages</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed">
                These packages are pre-installed in the sandbox and available in every submission without a{" "}
                <code className="font-mono text-slate-600 dark:text-slate-300">requirements.txt</code>.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { pkg: "numpy", version: ">=1.26", desc: "N-dimensional arrays and linear algebra" },
                  { pkg: "pandas", version: ">=2.0", desc: "DataFrames and time-series manipulation" },
                  { pkg: "scipy", version: "latest", desc: "Scientific computing and statistics" },
                  { pkg: "scikit-learn", version: ">=1.3", desc: "Machine learning preprocessing & metrics" },
                  { pkg: "statsmodels", version: "latest", desc: "Statistical models and tests" },
                  { pkg: "ta-lib", version: ">=0.6.5", desc: "Technical analysis indicators (RSI, MACD…)" },
                  { pkg: "numba", version: "latest", desc: "JIT compilation for numerical loops" },
                  { pkg: "joblib", version: "latest", desc: "Parallel computation and caching" },
                ].map(({ pkg, version, desc }) => (
                  <div key={pkg} className="bg-slate-100/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                    <p className="text-emerald-400 font-mono font-semibold text-sm">{pkg}</p>
                    <p className="text-slate-600 font-mono text-xs mb-1">{version}</p>
                    <p className="text-slate-500 text-xs leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-violet-500/5 border border-violet-500/20 p-4">
                <p className="text-violet-400 text-xs font-mono uppercase tracking-widest mb-1">Technical Indicators — ta-lib</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  <code className="font-mono text-slate-600 dark:text-slate-300">ta-lib</code> gives you over 150 technical indicators with a single import:{" "}
                  RSI, MACD, Bollinger Bands, ATR, Stochastic, ADX, and more. These are computed directly on the{" "}
                  <code className="font-mono text-slate-600 dark:text-slate-300">prices</code> array your strategy receives —{" "}
                  no extra data needed. This is the recommended starting point for signal engineering.
                </p>
              </div>
              <p className="text-slate-600 text-xs mt-4">
                Need a package not in this list? Message an admin on Discord.
              </p>
            </div>
          </Section>

          {/* Backtester Mechanics */}
          <Section id="backtester">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-2">Backtester Mechanics</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Understanding how the backtester processes your actions helps you avoid common pitfalls.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    title: "Long Positions",
                    desc: "A positive action buys shares at the day's Open price. The trade only executes if you have sufficient cash. Cash is reduced immediately.",
                    color: "border-emerald-500 bg-emerald-500/5",
                  },
                  {
                    title: "Short Positions",
                    desc: "A negative action when you hold zero or negative shares opens a short. Short proceeds are credited to cash. Short positions are tracked internally.",
                    color: "border-rose-500 bg-rose-500/5",
                  },
                  {
                    title: "Covering Shorts",
                    desc: "A positive action when you hold a short position covers (buys back) existing shorts first, FIFO. Any remaining buy quantity then goes long.",
                    color: "border-sky-500 bg-sky-500/5",
                  },
                  {
                    title: "Selling Longs",
                    desc: "A negative action when you hold a long position sells existing shares first. Any remaining sell quantity opens a short.",
                    color: "border-amber-500 bg-amber-500/5",
                  },
                ].map(({ title, desc, color }) => (
                  <div key={title} className={`rounded-xl p-4 border-l-4 ${color}`}>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold mb-1">{title}</p>
                    <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <CodeBlock code={BACKTESTER_EXAMPLE} lang="python — backtester example" />

              <div className="mt-4 rounded-xl bg-rose-500/5 border border-rose-500/20 p-4">
                <p className="text-rose-400 text-xs font-mono uppercase tracking-widest mb-1">Failure Conditions</p>
                <ul className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-1 list-disc list-inside">
                  <li>Portfolio value goes negative (too many uncovered shorts).</li>
                  <li>Strategy exceeds the runtime or memory limit.</li>
                  <li>
                    <code className="font-mono text-slate-600 dark:text-slate-300">get_actions</code> raises an unhandled exception.
                  </li>
                  <li>Output shape does not match input shape.</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* Scoring */}
          <Section id="scoring">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-6">Scoring</h2>
              <div className="flex flex-col gap-5 mb-6">
                {[
                  {
                    rank: "1st",
                    label: "Final PnL",
                    desc: "Cumulative profit and loss from $25,000 starting capital at end of the backtest window. Higher is better.",
                    color: "border-emerald-500",
                    textColor: "text-emerald-400",
                    bg: "bg-emerald-500/5",
                  },
                  {
                    rank: "2nd",
                    label: "Sharpe Ratio",
                    desc: "Annualised Sharpe Ratio: √252 × (mean daily return / std of daily returns). Used as the primary tiebreaker.",
                    color: "border-sky-500",
                    textColor: "text-sky-400",
                    bg: "bg-sky-500/5",
                  },
                  {
                    rank: "3rd",
                    label: "Max Drawdown",
                    desc: "Maximum peak-to-trough decline in portfolio value as a fraction. Less negative (closer to 0) is better. Third tiebreaker.",
                    color: "border-amber-500",
                    textColor: "text-amber-400",
                    bg: "bg-amber-500/5",
                  },
                ].map(({ rank, label, desc, color, textColor, bg }, i) => (
                  <div key={i} className={`rounded-xl p-4 border-l-4 ${color} ${bg} flex gap-4`}>
                    <div className={`font-mono text-2xl font-bold ${textColor} shrink-0`}>{rank}</div>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold mb-1">{label}</p>
                      <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-slate-500 text-xs mb-2 font-mono">Sharpe calculation (from backtester.py)</p>
                <CodeBlock code={SHARPE_FORMULA} lang="python" />
              </div>

              <div className="mt-5 rounded-xl bg-violet-500/5 border border-violet-500/20 p-4">
                <p className="text-violet-400 text-xs font-mono uppercase tracking-widest mb-1">Public vs Hidden Scoring</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  The live leaderboard uses the known validation dataset. The final ranking uses a separate{" "}
                  <span className="text-slate-800 dark:text-slate-200 font-medium">out-of-sample hidden test set</span>. The same strategy code is evaluated
                  — no resubmission required.
                </p>
              </div>
            </div>
          </Section>

          {/* Constraints */}
          <Section id="constraints">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-5">Constraints</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { constraint: "Runtime Limit", value: "60 seconds", note: "Wall-clock time for get_actions to return" },
                  { constraint: "Memory Limit", value: "512 MB", note: "Peak RSS during strategy execution" },
                  { constraint: "File Size (.py)", value: "1 MB", note: "Uncompressed single-file submissions" },
                  { constraint: "File Size (.zip)", value: "10 MB", note: "Includes strategy + extra packages" },
                  { constraint: "Daily Submissions", value: "5 per team", note: "Resets at midnight EST" },
                  { constraint: "Fractional Shares", value: "Not supported", note: "Actions are rounded to nearest integer" },
                  { constraint: "Network Access", value: "Disabled", note: "No outbound connections from sandbox" },
                  { constraint: "File I/O", value: "Disabled", note: "Read/write access is blocked in sandbox" },
                  { constraint: "Transaction Fee", value: "0.1% per trade", note: "Applied to the notional value of every buy or sell" },
                  { constraint: "Position Limit", value: "100 shares", note: "Maximum absolute position per stock at any time" },
                ].map(({ constraint, value, note }, i) => (
                  <div key={i} className="bg-slate-100/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-xs mb-1">{constraint}</p>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold mono-nums">{value}</p>
                    <p className="text-slate-600 text-xs mt-1">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Rules & Integrity */}
          <Section id="rules">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-2">Rules &amp; Integrity</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                All strategies are evaluated on anonymised price data. The following conduct rules apply to every participant.
                Violations are taken seriously and consequences apply to the entire team and conference standing.
              </p>

              <div className="flex flex-col gap-4 mb-6">
                <div className="rounded-xl border-l-4 border-rose-500 bg-rose-500/5 p-5">
                  <p className="text-rose-400 text-xs font-mono uppercase tracking-widest mb-2">Prohibited — Future Price Trading</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">
                    Your <code className="font-mono text-slate-600 dark:text-slate-300">get_actions</code> function receives the <em>full</em> price matrix at
                    once, meaning future prices are technically present in the array. You must <strong className="text-slate-800 dark:text-slate-200">not</strong> use
                    any price at index <code className="font-mono text-slate-600 dark:text-slate-300">t</code> when deciding the action for a day earlier than{" "}
                    <code className="font-mono text-slate-600 dark:text-slate-300">t</code>. Strategies that look ahead in time — directly or via derived
                    features — constitute <span className="text-rose-600 dark:text-rose-300 font-semibold">future price trading</span> and are disqualified.
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed">
                    Examples of violations: using <code className="font-mono text-slate-400">prices[i, t+1]</code> in day-t decisions,
                    sorting or ranking stocks by future returns, or training a model on out-of-sample future labels.
                  </p>
                </div>

                <div className="rounded-xl border-l-4 border-rose-500 bg-rose-500/5 p-5">
                  <p className="text-rose-400 text-xs font-mono uppercase tracking-widest mb-2">Prohibited — Identifying the Underlying Securities</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    The price data is anonymised — tickers are replaced with synthetic labels and the time axis is obscured. Attempting to
                    reverse-engineer or identify the real underlying securities (e.g. by cross-referencing price patterns against public market
                    data) and incorporating that knowledge into your strategy is strictly prohibited. Strategies must operate solely on the
                    provided data as-is.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-5">
                <p className="text-rose-600 dark:text-rose-300 text-sm font-semibold mb-2">Consequences of Violation</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Any team found in violation of the above rules will be{" "}
                  <span className="text-rose-600 dark:text-rose-300 font-semibold">immediately disqualified from the competition</span>. This disqualification
                  applies to the <span className="text-slate-800 dark:text-slate-200 font-medium">entire team</span> and extends to the{" "}
                  <span className="text-slate-800 dark:text-slate-200 font-medium">entire conference</span> — all members lose eligibility for prizes and
                  recognition across all MIG competition events.
                </p>
              </div>
            </div>
          </Section>

          {/* Sample Repo */}
          <Section id="sample">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-2">Sample Repo</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                The <code className="text-sky-400 font-mono text-sm">sample/</code> folder at the root of this repository contains
                everything you need to develop and test your strategy locally.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    file: "sample_strategy.py",
                    desc: "A working 5/20-day moving average crossover strategy. Use it as a template.",
                    tag: ".py",
                    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  },
                  {
                    file: "requirements.txt",
                    desc: "Mirrors the sandbox environment — pin your local packages to the same versions.",
                    tag: ".txt",
                    tagColor: "text-slate-400 bg-slate-500/10 border-slate-500/20",
                  },
                  {
                    file: "dev_data.csv",
                    desc: "Full OHLCV dataset for all 50 stocks. Use this for local research and strategy testing.",
                    tag: ".csv",
                    tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                  },
                  {
                    file: "notebooks/01_data_exploration.ipynb",
                    desc: "Explore the dataset: price distributions, correlations, and feature engineering ideas.",
                    tag: ".ipynb",
                    tagColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                  },
                  {
                    file: "notebooks/02_strategy_development.ipynb",
                    desc: "Build, backtest, and score a strategy locally before submitting.",
                    tag: ".ipynb",
                    tagColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                  },
                ].map(({ file, desc, tag, tagColor }) => (
                  <div key={file} className="bg-slate-100/80 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex gap-3">
                    <span className={`text-xs font-mono px-2 py-0.5 h-fit rounded-full border ${tagColor} shrink-0`}>{tag}</span>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-mono font-semibold text-sm mb-1">{file}</p>
                      <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://github.com/AryamanGoenka0910/mig-quant-conference-2026-sample/tree/main"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-200 hover:border-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  View on GitHub
                </a>
              </div>

              <div className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-slate-500 text-xs font-mono mb-2">Clone and run locally</p>
                <CodeBlock
                  code={`git clone https://github.com/AryamanGoenka0910/mig-quant-conference-2026-sample.git
cd mig-quant-conference-2026-sample
pip install -r requirements.txt
jupyter notebook`}
                  lang="shell"
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
