import type { SubmissionStatus } from "@/types";

interface StatusBadgeProps {
  status: SubmissionStatus;
  showDot?: boolean;
}

const config: Record<
  SubmissionStatus,
  { label: string; classes: string; dotClass: string; pulse: boolean }
> = {
  queued: {
    label: "Queued",
    classes: "bg-slate-800 text-slate-400 border-slate-700",
    dotClass: "bg-slate-500",
    pulse: false,
  },
  running: {
    label: "Running",
    classes: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    dotClass: "bg-sky-400",
    pulse: true,
  },
  passed: {
    label: "Passed",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-400",
    pulse: false,
  },
  failed: {
    label: "Failed",
    classes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-400",
    pulse: false,
  },
  disqualified: {
    label: "Disqualified",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-400",
    pulse: false,
  },
};

export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const { label, classes, dotClass, pulse } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotClass} ${pulse ? "animate-pulse" : ""}`}
        />
      )}
      {label}
    </span>
  );
}
