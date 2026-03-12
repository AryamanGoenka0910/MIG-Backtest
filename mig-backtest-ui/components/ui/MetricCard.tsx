import SparklineChart from "@/components/charts/SparklineChart";

interface MetricCardProps {
  label: string;
  value: string;
  subLabel?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  glowColor?: "emerald" | "sky" | "rose";
  sparkline?: number[];
  className?: string;
}

const glowStyles: Record<string, string> = {
  emerald: "shadow-[0_0_24px_rgba(16,185,129,0.12)]",
  sky:     "shadow-[0_0_24px_rgba(56,189,248,0.12)]",
  rose:    "shadow-[0_0_24px_rgba(244,63,94,0.12)]",
};

const trendColors: Record<string, string> = {
  up:      "text-emerald-400",
  down:    "text-rose-400",
  neutral: "text-slate-400",
};

const trendIcons: Record<string, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export default function MetricCard({
  label,
  value,
  subLabel,
  trend,
  trendValue,
  icon,
  glowColor,
  sparkline,
  className = "",
}: MetricCardProps) {
  const glowClass = glowColor ? glowStyles[glowColor] : "";

  return (
    <div className={`glass-card rounded-xl p-5 flex flex-col gap-3 ${glowClass} ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="mono-nums text-2xl font-semibold text-slate-100 leading-none">
          {value}
        </span>
        {sparkline && sparkline.length > 1 && (
          <SparklineChart data={sparkline} width={80} height={32} color="auto" />
        )}
      </div>

      {(trendValue || subLabel) && (
        <div className="flex items-center gap-2">
          {trend && trendValue && (
            <span className={`text-xs font-medium flex items-center gap-0.5 ${trendColors[trend]}`}>
              <span>{trendIcons[trend]}</span>
              {trendValue}
            </span>
          )}
          {subLabel && (
            <span className="text-xs text-slate-500">{subLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
