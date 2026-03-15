import type { Sponsor } from "@/types";

interface SponsorStripProps {
  sponsors: Sponsor[];
}

const tierConfig = {
  gold:   { label: "Gold", classes: "border-amber-500/30 text-amber-300 bg-amber-500/5 text-base px-8 py-4" },
  silver: { label: "Silver", classes: "border-slate-600/40 text-slate-300 bg-slate-800/30 text-sm px-6 py-3" },
  bronze: { label: "Bronze", classes: "border-slate-700/30 text-slate-500 bg-slate-900/30 text-xs px-5 py-3" },
};

export default function SponsorStrip({ sponsors }: SponsorStripProps) {
  const gold   = sponsors.filter(s => s.tier === "gold");
  const silver = sponsors.filter(s => s.tier === "silver");
  const bronze = sponsors.filter(s => s.tier === "bronze");

  return (
    <section className="py-16 border-t border-slate-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-600 text-xs font-mono uppercase tracking-widest mb-8">
          Presented By
        </p>

        <div className="flex flex-col gap-6 items-center">
          {/* Gold */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {gold.map(s => (
              <div
                key={s.name}
                className={`rounded-lg border font-bold tracking-wide ${tierConfig.gold.classes}`}
              >
                {s.logoPlaceholder}
              </div>
            ))}
          </div>

          {/* Silver */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {silver.map(s => (
              <div
                key={s.name}
                className={`rounded-lg border font-semibold tracking-wide ${tierConfig.silver.classes}`}
              >
                {s.logoPlaceholder}
              </div>
            ))}
          </div>

          {/* Bronze */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {bronze.map(s => (
              <div
                key={s.name}
                className={`rounded-lg border font-medium tracking-wide ${tierConfig.bronze.classes}`}
              >
                {s.logoPlaceholder}
              </div>
            ))}
          </div>

          <p className="text-slate-700 text-xs mt-2">
            Interested in sponsoring? Contact mig.quant.board@umich.edu
          </p>
        </div>
      </div>
    </section>
  );
}
