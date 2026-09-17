import React from "react";
import { Play, Pause, CheckCircle2, RotateCcw, Edit, Trash2 } from "lucide-react";

export const STATE_STYLES = {
  NEW: "bg-slate-100 text-slate-700 border-slate-300",
  READY: "bg-blue-50 text-blue-700 border-blue-200",
  RUNNING: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WAITING: "bg-amber-50 text-amber-700 border-amber-200",
  TERMINATED: "bg-slate-100 text-slate-500 border-slate-200 line-through decoration-slate-400",
};

export default function ProcessTable({
  processes,
  onStateChange,
  onEditProcess,
  onDeleteProcess,
}) {
  if (!processes || processes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
        <p className="text-sm font-medium">No processes available.</p>
        <p className="text-xs text-slate-400 mt-1">Add a process using the form above or click "Reset Sample Data".</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">PID</th>
              <th className="py-3 px-4">Arrival Time</th>
              <th className="py-3 px-4">Burst Time</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Memory</th>
              <th className="py-3 px-4">Current State</th>
              <th className="py-3 px-4 text-right">Lifecycle Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processes.map((p) => {
              const currentState = p.state || "READY";
              const badgeClass = STATE_STYLES[currentState] || STATE_STYLES.READY;

              return (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{p.arrivalTime}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{p.burstTime}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      {p.priority}
                      {p.priority === 1 && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded font-sans">High</span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {p.memory ? `${p.memory} MB` : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeClass}`}>
                      {currentState}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* NEW -> Move to Ready */}
                      {currentState === "NEW" && (
                        <button
                          onClick={() => onStateChange(p.id, "READY")}
                          className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                          title="Move to Ready"
                        >
                          To Ready
                        </button>
                      )}

                      {/* READY -> Start (RUNNING) */}
                      {currentState === "READY" && (
                        <button
                          onClick={() => onStateChange(p.id, "RUNNING")}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                          title="Dispatch to CPU"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                      )}

                      {/* RUNNING -> Wait or Terminate */}
                      {currentState === "RUNNING" && (
                        <>
                          <button
                            onClick={() => onStateChange(p.id, "WAITING")}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                            title="Block for I/O"
                          >
                            <Pause className="w-3 h-3" />
                            <span>Wait</span>
                          </button>
                          <button
                            onClick={() => onStateChange(p.id, "TERMINATED")}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                            title="Terminate Execution"
                          >
                            <CheckCircle2 className="w-3 h-3 text-slate-600" />
                            <span>Terminate</span>
                          </button>
                        </>
                      )}

                      {/* WAITING -> Resume (READY) */}
                      {currentState === "WAITING" && (
                        <button
                          onClick={() => onStateChange(p.id, "READY")}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                          title="I/O completed, move to Ready"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resume</span>
                        </button>
                      )}

                      {/* TERMINATED has no further state transitions */}
                      {currentState === "TERMINATED" && (
                        <span className="text-[11px] text-slate-400 italic px-2">Exited</span>
                      )}

                      {/* Edit button */}
                      {onEditProcess && (
                        <button
                          onClick={() => onEditProcess(p)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors ml-1"
                          title="Edit Process Properties"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete button */}
                      {onDeleteProcess && (
                        <button
                          onClick={() => onDeleteProcess(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Process"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
