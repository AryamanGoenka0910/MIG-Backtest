import type { Team } from "@/types";

interface PodiumCardsProps {
  teams: Team[];
}

const medals = ["🥇", "🥈", "🥉"];
const rankLabels = ["1st Place", "2nd Place", "3rd Place"];

const podiumConfig = [
  {
    border: "border-amber-500/30",
    shadow: "shadow-[0_0_24px_rgba(245,158,11,0.12)]",
    rankBg: "bg-amber-500/10",
    rankText: "text-amber-400",
    height: "lg:translate-y-0",
    order: "order-1 lg:order-2",
    labelColor: "text-amber-400",
  },
  {
    border: "border-slate-600/40",
    shadow: "",
    rankBg: "bg-slate-800",
    rankText: "text-slate-300",
    height: "lg:translate-y-4",
    order: "order-2 lg:order-1",
    labelColor: "text-slate-400",
  },
  {
    border: "border-amber-700/30",
    shadow: "",
    rankBg: "bg-amber-900/20",
    rankText: "text-amber-600",
    height: "lg:translate-y-6",
    order: "order-3",
    labelColor: "text-amber-600",
  },
];

function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}$${(pnl / 1000).toFixed(1)}k`;
}

export default function PodiumCards({ teams }: PodiumCardsProps) {
  const top3 = teams.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
      {top3.map((team, i) => {
        const cfg = podiumConfig[i];
        return (
          <div
            key={team.id}
            className={`glass-card rounded-2xl p-6 flex flex-col gap-4 border ${cfg.border} ${cfg.shadow} ${cfg.height} ${cfg.order} transition-transform`}
          >
            {/* Rank + medal */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-full ${cfg.rankBg} ${cfg.rankText}`}>
                #{team.rank} {rankLabels[i]}
              </span>
              <span className="text-2xl">{medals[i]}</span>
            </div>

            {/* Team info */}
            <div>
              <h3 className="text-slate-100 font-bold text-lg leading-tight">Team: {team.name}</h3>
            </div>

            {/* Sparkline + PnL */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className={`mono-nums text-2xl font-bold ${team.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatPnl(team.pnl)}
                </p>
                <p className="text-slate-600 text-xs mt-0.5">Final PnL</p>
              </div>
            </div>

            {/* Secondary metrics */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Sharpe</p>
                <p className="mono-nums text-slate-200 font-semibold">{team.sharpe.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Max DD</p>
                <p className="mono-nums text-rose-400 font-semibold">{(team.maxDrawdown * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
