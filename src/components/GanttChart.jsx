import React from "react";

// Distinct muted colors for university lab styling (avoid neon/bright gradients)
const PROCESS_COLORS = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-900" },
  { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-900" },
  { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-900" },
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-900" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-900" },
  { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-900" },
  { bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-900" },
];

export default function GanttChart({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center text-sm text-slate-500">
        Run the scheduler to generate the execution Gantt chart timeline.
      </div>
    );
  }

  // Map PIDs to consistent color palette
  const uniquePids = Array.from(new Set(timeline.map((s) => s.pid).filter((pid) => pid !== "IDLE")));
  const pidColorMap = {};
  uniquePids.forEach((pid, idx) => {
    pidColorMap[pid] = PROCESS_COLORS[idx % PROCESS_COLORS.length];
  });

  const totalDuration = timeline[timeline.length - 1].end - timeline[0].start;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">CPU Execution Gantt Chart</h3>
          <p className="text-xs text-slate-500">Chronological timeline of process execution slices</p>
        </div>
        <div className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          Total Duration: <span className="font-semibold text-slate-900">{totalDuration} units</span>
        </div>
      </div>

      {/* Horizontal Gantt Bar */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="min-w-[650px]">
          {/* Blocks */}
          <div className="flex h-14 w-full border border-slate-300 rounded-md overflow-hidden bg-slate-100 shadow-inner">
            {timeline.map((slice, idx) => {
              const isIdle = slice.pid === "IDLE";
              const colors = isIdle
                ? { bg: "bg-slate-200", border: "border-slate-300", text: "text-slate-600 italic" }
                : pidColorMap[slice.pid] || PROCESS_COLORS[0];

              // Proportional width with minimum width for visibility
              const flexGrow = slice.duration;

              return (
                <div
                  key={idx}
                  style={{ flexGrow, flexBasis: `${Math.max(slice.duration * 30, 48)}px` }}
                  className={`relative flex flex-col items-center justify-center border-r last:border-r-0 ${colors.bg} ${colors.border} transition-colors px-1 select-none`}
                  title={`${slice.pid}: ${slice.start} → ${slice.end} (${slice.duration} units)`}
                >
                  <span className={`text-xs font-bold font-mono ${colors.text}`}>
                    {slice.pid}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {slice.duration}u
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time markers below blocks */}
          <div className="relative flex w-full mt-1.5 text-[11px] font-mono text-slate-600">
            {timeline.map((slice, idx) => {
              const flexGrow = slice.duration;
              return (
                <div
                  key={idx}
                  style={{ flexGrow, flexBasis: `${Math.max(slice.duration * 30, 48)}px` }}
                  className="flex justify-between px-0.5"
                >
                  <span className="text-left">{slice.start}</span>
                  {idx === timeline.length - 1 && (
                    <span className="text-right font-bold text-slate-900">{slice.end}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-medium">Legend:</span>
        {uniquePids.map((pid) => {
          const color = pidColorMap[pid];
          return (
            <div key={pid} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm border ${color.bg} ${color.border}`}></span>
              <span className="font-mono text-slate-700">{pid}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border bg-slate-200 border-slate-300"></span>
          <span className="font-mono text-slate-500 italic">IDLE</span>
        </div>
      </div>
    </div>
  );
}
