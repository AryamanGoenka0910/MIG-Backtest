"use client";

import { useState, useMemo } from "react";
import type { Team } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";

type SortKey = "rank" | "pnl" | "sharpe" | "maxDrawdown" | "submissionsCount";
type SortDir = "asc" | "desc";

interface LeaderboardTableProps {
  teams: Team[];
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 inline-flex flex-col text-[8px] leading-none ${active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-700"}`}>
      <span className={dir === "asc" && active ? "text-emerald-400" : ""}>▲</span>
      <span className={dir === "desc" && active ? "text-emerald-400" : ""}>▼</span>
    </span>
  );
}

function formatPnl(pnl: number): string {
  const abs = Math.abs(pnl);
  const str = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs}`;
  return pnl >= 0 ? `+${str}` : `-${str}`;
}

export default function LeaderboardTable({ teams }: LeaderboardTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  };

  const sorted = useMemo(() => {
    let filtered = teams.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.school.toLowerCase().includes(q);
      return matchSearch;
    });

    filtered.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (sortKey === "maxDrawdown") {
        va = Math.abs(va as number);
        vb = Math.abs(vb as number);
      }
      const cmp = (va as number) < (vb as number) ? -1 : (va as number) > (vb as number) ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [teams, search, sortKey, sortDir]);

  const cols: { key: SortKey; label: string }[] = [
    { key: "pnl", label: "PnL" },
    { key: "sharpe", label: "Sharpe" },
    { key: "maxDrawdown", label: "Max DD" },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search team..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12">
                <button onClick={() => handleSort("rank")} className="flex items-center cursor-pointer hover:text-slate-300 transition-colors">
                  Rank <SortIcon active={sortKey === "rank"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Team</th>
              {cols.map(col => (
                <th key={col.key} className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button onClick={() => handleSort(col.key)} className="flex items-center justify-end ml-auto cursor-pointer hover:text-slate-300 transition-colors">
                    {col.label} <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-600">
                  No teams match your search
                </td>
              </tr>
            ) : (
              sorted.map((team, i) => (
                <tr
                  key={team.id}
                  className={`border-b border-slate-200/50 dark:border-slate-800/50 transition-colors ${
                    i % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/20" : "bg-transparent"
                  } hover:bg-slate-100/50 dark:hover:bg-slate-800/30`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3.5">
                    <span className={`mono-nums font-semibold text-sm ${
                      team.rank <= 3 ? "text-amber-400" : "text-slate-500"
                    }`}>
                      {team.rank <= 3 ? ["🥇", "🥈", "🥉"][team.rank - 1] : `#${team.rank}`}
                    </span>
                  </td>

                  {/* Team */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{team.name}</div>
                    <div className="text-slate-400 dark:text-slate-600 text-xs lg:hidden">{team.school}</div>
                  </td>

                  {/* PnL */}
                  <td className="px-4 py-3.5 text-right">
                    <span className={`mono-nums font-semibold ${team.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {formatPnl(team.pnl)}
                    </span>
                  </td>

                  {/* Sharpe */}
                  <td className="px-4 py-3.5 text-right">
                    <span className={`mono-nums ${team.sharpe >= 1.5 ? "text-emerald-600 dark:text-emerald-400" : team.sharpe >= 0 ? "text-slate-700 dark:text-slate-300" : "text-rose-600 dark:text-rose-400"}`}>
                      {team.sharpe.toFixed(2)}
                    </span>
                  </td>

                  {/* Max DD */}
                  <td className="px-4 py-3.5 text-right">
                    <span className="mono-nums text-rose-600 dark:text-rose-400">
                      {(team.maxDrawdown * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-slate-400 dark:text-slate-600 text-xs mt-3 text-right mono-nums">
        Showing {sorted.length} of {teams.length} teams · Updated 2 hours ago
      </p>
    </div>
  );
}
