"use client";

import PodiumCards from "@/components/leaderboard/PodiumCards";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import Tabs from "@/components/ui/Tabs";
import type { Team } from "@/types";

interface LeaderboardViewProps {
  teams: Team[];
}

export default function LeaderboardView({ teams }: LeaderboardViewProps) {
  return (
    <>
      {/* Podium */}
      <div className="mb-10">
        <h2 className="text-sm font-mono uppercase tracking-widest text-slate-500 mb-5">Top 3</h2>
        <PodiumCards teams={teams} />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "public", label: "Public Leaderboard", count: teams.length },
          {
            id: "final",
            label: "Final Results",
            disabled: true,
            lockedLabel: "Final results will be revealed on March 28, 2026",
          },
        ]}
        defaultTab="public"
      >
        {(activeTab) =>
          activeTab === "public" ? (
            <LeaderboardTable teams={teams} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mb-4">
                🔒
              </div>
              <h3 className="text-slate-300 font-semibold text-lg mb-2">Final Results Locked</h3>
              <p className="text-slate-500 max-w-sm">
                Final rankings will be revealed on{" "}
                <span className="text-slate-300 font-medium">March 28, 2026</span> after evaluation
                on the hidden out-of-sample dataset.
              </p>
            </div>
          )
        }
      </Tabs>
    </>
  );
}
