// "use client";

// import { useState } from "react";
// import MetricCard from "@/components/ui/MetricCard";
// import StatusBadge from "@/components/ui/StatusBadge";
// import Button from "@/components/ui/Button";
// import { mockSubmissions, mockAdminLogs, mockLeaderboardStats } from "@/lib/mockData";
// import type { SubmissionStatus } from "@/types";

// function formatDate(iso: string): string {
//   return new Date(iso).toLocaleString("en-US", {
//     month: "short",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
// }

// const logLevelConfig = {
//   info:    { classes: "bg-sky-500/10 text-sky-400 border-sky-500/20", dot: "bg-sky-400" },
//   warning: { classes: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
//   error:   { classes: "bg-rose-500/10 text-rose-400 border-rose-500/20", dot: "bg-rose-400" },
// };

// export default function AdminPage() {
//   const [leaderboardFrozen, setLeaderboardFrozen] = useState(false);
//   const [submissions, setSubmissions] = useState(mockSubmissions);

//   const queued   = submissions.filter(s => s.status === "queued").length;
//   const running  = submissions.filter(s => s.status === "running").length;
//   const failed   = submissions.filter(s => s.status === "failed").length;
//   const passed   = submissions.filter(s => s.status === "passed").length;

//   const handleRerun = (id: number) => {
//     setSubmissions(prev =>
//       prev.map(s => s.id === id ? { ...s, status: "queued" as SubmissionStatus, score: null, pnl: null, sharpe: null } : s)
//     );
//   };

//   const handleDisqualify = (id: number) => {
//     setSubmissions(prev =>
//       prev.map(s => s.id === id ? { ...s, status: "disqualified" as SubmissionStatus } : s)
//     );
//   };

//   return (
//     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
//         <div>
//           <div className="flex items-center gap-3 mb-1">
//             <p className="text-rose-400 text-xs font-mono uppercase tracking-widest">Internal</p>
//             <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
//               Admin Access
//             </span>
//           </div>
//           <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">Admin Dashboard</h1>
//         </div>
//         <div className="flex items-center gap-3">
//           <Button
//             variant={leaderboardFrozen ? "secondary" : "danger"}
//             onClick={() => setLeaderboardFrozen(!leaderboardFrozen)}
//           >
//             {leaderboardFrozen ? (
//               <>
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
//                 </svg>
//                 Leaderboard Frozen
//               </>
//             ) : (
//               <>
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" />
//                 </svg>
//                 Freeze Leaderboard
//               </>
//             )}
//           </Button>
//           <Button variant="secondary" onClick={() => alert("Exporting CSV…")}>
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             Export CSV
//           </Button>
//         </div>
//       </div>

//       {/* System health metrics */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <MetricCard
//           label="Teams Registered"
//           value={String(mockLeaderboardStats.totalTeams)}
//           subLabel="18 universities"
//           glowColor="emerald"
//         />
//         <MetricCard
//           label="Total Submissions"
//           value={String(mockLeaderboardStats.totalSubmissions)}
//           trend="up"
//           trendValue="+3 today"
//         />
//         <MetricCard
//           label="Queued / Running"
//           value={`${queued} / ${running}`}
//           subLabel="pipeline status"
//           glowColor={queued + running > 2 ? "sky" : undefined}
//         />
//         <MetricCard
//           label="Failed Runs"
//           value={String(failed)}
//           subLabel={`${passed} passed`}
//           glowColor={failed > 2 ? "rose" : undefined}
//         />
//       </div>

//       {/* Leaderboard frozen banner */}
//       {leaderboardFrozen && (
//         <div className="glass-card rounded-xl p-4 border-l-4 border-amber-500 bg-amber-500/5 flex items-center gap-3 mb-6">
//           <span className="text-amber-400 text-lg">🔒</span>
//           <div>
//             <p className="text-amber-300 font-semibold text-sm">Leaderboard is frozen</p>
//             <p className="text-slate-500 text-xs">No new rankings will be published. Backtesting continues in the background.</p>
//           </div>
//         </div>
//       )}

//       {/* Submissions table */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-slate-200 font-semibold text-lg">All Submissions</h2>
//           <Button variant="secondary" size="sm" onClick={() => alert("Re-running all pending…")}>
//             Run All Pending
//           </Button>
//         </div>
//         <div className="overflow-x-auto rounded-xl border border-slate-800">
//           <table className="w-full text-sm border-collapse">
//             <thead>
//               <tr className="border-b border-slate-800 bg-slate-900/60">
//                 {["ID", "Team", "School", "File", "Submitted", "Status", "Score", "Actions"].map(h => (
//                   <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {submissions.map((sub, i) => (
//                 <tr
//                   key={sub.id}
//                   className={`border-b border-slate-800/40 transition-colors ${i % 2 === 0 ? "bg-slate-900/20" : "bg-transparent"} hover:bg-slate-800/20`}
//                 >
//                   <td className="px-4 py-3 mono-nums text-slate-600 text-xs">#{sub.id}</td>
//                   <td className="px-4 py-3 font-semibold text-slate-200 text-sm">{sub.teamName}</td>
//                   <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{sub.school}</td>
//                   <td className="px-4 py-3 font-mono text-slate-400 text-xs max-w-[140px]">
//                     <span className="truncate block">{sub.fileName}</span>
//                     {sub.errorMessage && (
//                       <span className="text-rose-500 text-[10px] truncate block" title={sub.errorMessage}>
//                         {sub.errorMessage.slice(0, 40)}…
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-4 py-3 mono-nums text-slate-600 text-xs hidden lg:table-cell whitespace-nowrap">
//                     {formatDate(sub.timestamp)}
//                   </td>
//                   <td className="px-4 py-3">
//                     <StatusBadge status={sub.status} />
//                   </td>
//                   <td className="px-4 py-3 mono-nums text-sm">
//                     {sub.sharpe !== null ? (
//                       <span className={sub.sharpe >= 1 ? "text-emerald-400" : "text-slate-400"}>
//                         {sub.sharpe.toFixed(2)}
//                       </span>
//                     ) : (
//                       <span className="text-slate-700">—</span>
//                     )}
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handleRerun(sub.id)}
//                         className="text-xs text-sky-500 hover:text-sky-300 transition-colors font-medium cursor-pointer"
//                         title="Re-run this submission"
//                       >
//                         Re-run
//                       </button>
//                       {sub.status !== "disqualified" && (
//                         <button
//                           onClick={() => handleDisqualify(sub.id)}
//                           className="text-xs text-rose-600 hover:text-rose-400 transition-colors font-medium cursor-pointer"
//                           title="Disqualify this team"
//                         >
//                           DQ
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* System Logs */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-slate-200 font-semibold text-lg">System Logs</h2>
//           <span className="text-xs mono-nums text-slate-600">{mockAdminLogs.length} entries</span>
//         </div>
//         <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
//           <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
//             {mockAdminLogs.map(log => {
//               const cfg = logLevelConfig[log.level];
//               return (
//                 <div key={log.id} className="px-5 py-3.5 hover:bg-slate-800/20 transition-colors">
//                   <div className="flex items-start gap-3">
//                     <span className={`mt-0.5 shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1.5 ${cfg.classes}`}>
//                       <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
//                       {log.level}
//                     </span>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-baseline justify-between gap-3">
//                         <p className="text-slate-300 text-sm font-medium">{log.message}</p>
//                         <span className="mono-nums text-slate-700 text-xs shrink-0">
//                           {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
//                         </span>
//                       </div>
//                       {log.details && (
//                         <p className="text-slate-600 text-xs mt-0.5 font-mono truncate">{log.details}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
