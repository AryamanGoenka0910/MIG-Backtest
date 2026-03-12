import UploadDropzone from "@/components/submission/UploadDropzone";
import SubmissionHistory from "@/components/submission/SubmissionHistory";
import MetricCard from "@/components/ui/MetricCard";
import { mockSubmissions, mockTeams } from "@/lib/mockData";

const myTeam = mockTeams[0];
const mySubmissions = mockSubmissions.filter(s => s.teamId === "team-001");
const latestPassed = mySubmissions.find(s => s.status === "passed");

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2">Upload</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Submit Strategy</h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-slate-500">Upload your Python strategy file for evaluation.</p>
          <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono shrink-0">
            Deadline: Mar 20 · 11:59 PM EST
          </span>
        </div>
      </div>

      {/* Current score snapshot */}
      {latestPassed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Current Rank"
            value={`#${myTeam.rank}`}
            subLabel="out of 18 teams"
            glowColor="emerald"
          />
          <MetricCard
            label="Best PnL"
            value={`+$${(myTeam.pnl / 1000).toFixed(1)}k`}
            sparkline={myTeam.sparklineData}
          />
          <MetricCard
            label="Best Sharpe"
            value={myTeam.sharpe.toFixed(2)}
            glowColor="sky"
          />
          <MetricCard
            label="Submissions Used"
            value={`${myTeam.submissionsCount} / 5`}
            subLabel="today"
          />
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: upload + history */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-slate-200 font-semibold text-lg mb-5">Upload Strategy File</h2>
            <UploadDropzone maxSizeMB={1} />
          </div>

          <div>
            <h2 className="text-slate-200 font-semibold text-lg mb-4">Submission History</h2>
            <SubmissionHistory submissions={mySubmissions} />
          </div>
        </div>

        {/* Right: rules sidebar */}
        <div className="flex flex-col gap-4">
          {/* Submission limits */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
              <span className="text-amber-400">⚠</span> Submission Rules
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-slate-400">
              {[
                { icon: "📁", text: "Python files (.py) only" },
                { icon: "📏", text: "Max file size: 1 MB" },
                { icon: "🔢", text: "Max 5 submissions per day" },
                { icon: "⏱", text: "Runtime limit: 30 seconds" },
                { icon: "💾", text: "Memory limit: 512 MB" },
                { icon: "📦", text: "Allowed: numpy, pandas, scipy, sklearn" },
              ].map(({ icon, text }, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-base shrink-0">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required interface */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-slate-200 font-semibold mb-3">Required Interface</h3>
            <p className="text-slate-500 text-xs mb-3">Your file must define this function:</p>
            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-xs font-mono leading-relaxed overflow-x-auto">
              <span className="text-violet-400">import</span>{" "}
              <span className="text-slate-300">numpy</span>{" "}
              <span className="text-violet-400">as</span>{" "}
              <span className="text-slate-300">np</span>
              <br /><br />
              <span className="text-sky-400">def</span>{" "}
              <span className="text-emerald-400">get_actions</span>
              <span className="text-slate-300">(</span>
              <span className="text-amber-300">prices</span>
              <span className="text-slate-500">: np.ndarray</span>
              <span className="text-slate-300">)</span>
              <span className="text-slate-500"> -{">"} np.ndarray</span>
              <span className="text-slate-300">:</span>
              <br />
              <span className="text-slate-600 ml-4"># prices: shape (T, 5)</span>
              <br />
              <span className="text-slate-600 ml-4"># return: shape (T, 5)</span>
              <br />
              <span className="text-slate-600 ml-4"># values in [-100, 100]</span>
              <br />
              <span className="text-slate-600 ml-4">...</span>
            </div>
          </div>

          {/* Scoring */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-slate-200 font-semibold mb-3">How Scoring Works</h3>
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
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-600">
                Transaction costs: 5bps per trade · Position limits: ±100 units/asset
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
