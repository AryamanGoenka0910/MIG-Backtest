import type { TimelineEvent } from "@/types";

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />

      <div className="flex flex-col gap-0">
        {events.map((event, i) => (
          <div key={event.id} className="relative flex gap-6 pb-8 last:pb-0">
            {/* Dot */}
            <div className="relative z-10 flex-shrink-0 w-8 flex items-start justify-center pt-1">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  event.status === "completed"
                    ? "bg-emerald-500 border-emerald-500"
                    : event.status === "active"
                    ? "bg-sky-400 border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] animate-pulse"
                    : "bg-slate-800 border-slate-700"
                }`}
              />
            </div>

            {/* Content */}
            <div className={`flex-1 glass-card rounded-xl p-4 ${
              event.status === "active" ? "border-sky-500/30 shadow-[0_0_16px_rgba(56,189,248,0.08)]" : ""
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                <h3 className={`font-semibold text-sm ${
                  event.status === "completed"
                    ? "text-slate-300"
                    : event.status === "active"
                    ? "text-sky-300"
                    : "text-slate-400"
                }`}>
                  {event.phase}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="mono-nums text-xs text-slate-500">{event.date}</span>
                  {event.status === "completed" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Done
                    </span>
                  )}
                  {event.status === "active" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      Active
                    </span>
                  )}
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
