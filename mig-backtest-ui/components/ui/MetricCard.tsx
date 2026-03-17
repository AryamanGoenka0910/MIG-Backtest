interface MetricCardProps {
  label: string;
  value: string;
  subLabel?: string;
  glowColor?: "emerald" | "sky" | "rose";
  valueColor?: "emerald" | "rose" | "default";
  className?: string;
}

const glowStyles: Record<string, string> = {
  emerald: "shadow-[0_0_32px_#10b98166]",
  sky:     "shadow-[0_0_24px_#38bdf833]",
  rose:    "shadow-[0_0_32px_#f43f5e66]",
};

const valueColorStyles: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  rose:    "text-rose-600 dark:text-rose-400",
  default: "text-slate-900 dark:text-slate-100",
};

export default function MetricCard({
  label,
  value,
  subLabel,
  glowColor,
  valueColor = "default",
  className = "",
}: MetricCardProps) {
  const glowClass = glowColor ? glowStyles[glowColor] : "";
  const valueClass = valueColorStyles[valueColor];

  return (
    <div className={`glass-card rounded-xl p-5 flex flex-col gap-3 ${glowClass} ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{label}</span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className={`mono-nums text-2xl font-semibold leading-none ${valueClass}`}>
          {value}
        </span>
      </div>

      {(subLabel) && (
        <div className="flex items-center gap-2">
          {subLabel && (
            <span className="text-xs text-slate-500">{subLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
