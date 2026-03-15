import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UploadDropzone from "@/components/submission/UploadDropzone";
import SubmissionHistory from "@/components/submission/SubmissionHistory";
import { mockSubmissions, mockTeams } from "@/lib/mockData";

const myTeam = mockTeams[0];
const mySubmissions = mockSubmissions.filter(s => s.teamId === "team-001");

export default async function SubmitPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("team_id")
    .eq("user_id", user.id)
    .single();

  const teamId = (profile?.team_id as string | undefined) ?? user.id;

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

      {/* Info cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Submission Rules */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2 text-sm">
            <span className="text-amber-400">⚠</span> Submission Rules
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            {[
              { icon: "📁", text: "Python files (.py) only" },
              { icon: "📏", text: "Max file size: 1 MB" },
              { icon: "🔢", text: "Max 5 submissions per day" },
              { icon: "⏱", text: "Runtime limit: 30 seconds" },
              { icon: "💾", text: "Memory limit: 512 MB" },
              { icon: "📦", text: "Allowed: numpy, pandas, scipy, sklearn" },
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
          <h3 className="text-slate-200 font-semibold mb-2 text-sm">Required Interface</h3>
          <p className="text-slate-500 text-xs mb-3">Your file must define this function:</p>
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-xs font-mono leading-relaxed overflow-x-auto">
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
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-slate-200 font-semibold mb-3 text-sm">How Scoring Works</h3>
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

      {/* Upload + Submissions Used */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-slate-200 font-semibold text-lg mb-5">Upload Strategy File</h2>
          <UploadDropzone userId={user.id} teamId={teamId} maxSizeMB={1} />
        </div>

        {/* Submissions Used */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-center items-center text-center gap-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Submissions Used</p>
          <p className="text-5xl font-bold text-slate-100 mono-nums">{myTeam.submissionsCount}</p>
          <p className="text-slate-600 text-sm font-mono">/ 5 today</p>
          <div className="flex gap-1.5 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full ${i < myTeam.submissionsCount ? "bg-emerald-500" : "bg-slate-800"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Submission History */}
      <div>
        <h2 className="text-slate-200 font-semibold text-lg mb-4">Submission History</h2>
        <SubmissionHistory submissions={mySubmissions} />
      </div>
    </div>
  );
}
