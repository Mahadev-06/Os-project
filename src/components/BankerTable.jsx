import React from "react";
import { ArrowRight, CheckCircle2, XCircle, Plus, Trash2 } from "lucide-react";
import { DEFAULT_BANKER_DATA, UNSAFE_BANKER_DATA } from "../data/sampleBankerData";

export default function BankerTable({
  bankerData,
  onUpdateAvailable,
  onUpdateProcessValue,
  onAddProcess,
  onRemoveProcess,
  onLoadPreset,
  safetyResult,
  onCheckSafety,
}) {
  const { resourceNames, available, processes } = bankerData;

  return (
    <div className="space-y-6">
      {/* Top Controls & Preset Switcher */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presets:</span>
          <button
            onClick={() => onLoadPreset(DEFAULT_BANKER_DATA)}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
          >
            Standard Safe Case (5 Processes)
          </button>
          <button
            onClick={() => onLoadPreset(UNSAFE_BANKER_DATA)}
            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
          >
            Deadlock / Unsafe Case
          </button>
        </div>

        <div className="flex items-center gap-2">
          {processes.length < 5 && (
            <button
              onClick={onAddProcess}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Process (max 5)</span>
            </button>
          )}
          <button
            onClick={onCheckSafety}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Check Safety</span>
          </button>
        </div>
      </div>

      {/* Available Vector Configuration */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Available Resource Vector [A, B, C]
        </h4>
        <div className="flex items-center gap-4">
          {resourceNames.map((res, idx) => (
            <div key={res} className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-700 w-4">{res}:</span>
              <input
                type="number"
                min="0"
                value={available[idx]}
                onChange={(e) => onUpdateAvailable(idx, e.target.value)}
                className="w-16 px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
          <span className="text-xs text-slate-400 italic">
            Currently unallocated units free in the system
          </span>
        </div>
      </div>

      {/* Matrices Table: Allocation, Maximum, Need */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4" rowSpan={2}>Process</th>
                <th className="py-2 px-4 text-center border-l border-slate-200 bg-slate-100/70" colSpan={3}>
                  Allocation Matrix
                </th>
                <th className="py-2 px-4 text-center border-l border-slate-200 bg-slate-100/70" colSpan={3}>
                  Maximum Matrix
                </th>
                <th className="py-2 px-4 text-center border-l border-slate-200 bg-blue-50/70 text-blue-900" colSpan={3}>
                  Need Matrix (Max - Alloc)
                </th>
                <th className="py-3 px-4 text-right" rowSpan={2}>Actions</th>
              </tr>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-mono text-slate-500">
                {/* Allocation Cols */}
                {resourceNames.map((r) => (
                  <th key={`alloc-h-${r}`} className="py-1 px-2 text-center border-l border-slate-200">{r}</th>
                ))}
                {/* Max Cols */}
                {resourceNames.map((r) => (
                  <th key={`max-h-${r}`} className="py-1 px-2 text-center border-l border-slate-200">{r}</th>
                ))}
                {/* Need Cols */}
                {resourceNames.map((r) => (
                  <th key={`need-h-${r}`} className="py-1 px-2 text-center border-l border-slate-200 text-blue-800">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processes.map((p, pIdx) => {
                const need = resourceNames.map((_, rIdx) => {
                  const m = Number(p.max[rIdx] || 0);
                  const a = Number(p.allocation[rIdx] || 0);
                  return m - a;
                });

                const hasError = need.some((val) => val < 0);

                return (
                  <tr key={p.id} className={hasError ? "bg-rose-50/40" : "hover:bg-slate-50/50"}>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{p.id}</td>

                    {/* Allocation Inputs */}
                    {resourceNames.map((_, rIdx) => (
                      <td key={`alloc-${p.id}-${rIdx}`} className="py-1.5 px-2 text-center border-l border-slate-100">
                        <input
                          type="number"
                          min="0"
                          value={p.allocation[rIdx]}
                          onChange={(e) => onUpdateProcessValue(pIdx, "allocation", rIdx, e.target.value)}
                          className="w-14 text-center px-1 py-1 font-mono text-xs border border-slate-300 rounded outline-none focus:border-blue-500"
                        />
                      </td>
                    ))}

                    {/* Max Inputs */}
                    {resourceNames.map((_, rIdx) => (
                      <td key={`max-${p.id}-${rIdx}`} className="py-1.5 px-2 text-center border-l border-slate-100">
                        <input
                          type="number"
                          min="0"
                          value={p.max[rIdx]}
                          onChange={(e) => onUpdateProcessValue(pIdx, "max", rIdx, e.target.value)}
                          className="w-14 text-center px-1 py-1 font-mono text-xs border border-slate-300 rounded outline-none focus:border-blue-500"
                        />
                      </td>
                    ))}

                    {/* Need Display (Auto-calculated) */}
                    {need.map((val, rIdx) => (
                      <td key={`need-${p.id}-${rIdx}`} className="py-1.5 px-2 text-center border-l border-slate-100 bg-blue-50/30">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            val < 0 ? "text-rose-600 font-bold" : "text-blue-900"
                          }`}
                        >
                          {val}
                        </span>
                      </td>
                    ))}

                    {/* Delete Process (if > 3 processes) */}
                    <td className="py-2.5 px-4 text-right">
                      {processes.length > 3 ? (
                        <button
                          onClick={() => onRemoveProcess(pIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          title="Remove process"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">min 3</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Analysis Result Banner */}
      {safetyResult && (
        <div
          className={`rounded-lg border p-5 shadow-sm transition-all ${
            safetyResult.isSafe
              ? "bg-emerald-50/60 border-emerald-300"
              : "bg-rose-50/60 border-rose-300"
          }`}
        >
          <div className="flex items-start gap-3">
            {safetyResult.isSafe ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-base font-bold ${
                    safetyResult.isSafe ? "text-emerald-900" : "text-rose-900"
                  }`}
                >
                  {safetyResult.isSafe ? "SAFE STATE" : "UNSAFE STATE"}
                </h3>
                <span
                  className={`text-xs px-2.5 py-1 rounded font-medium border ${
                    safetyResult.isSafe
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-rose-100 text-rose-800 border-rose-200"
                  }`}
                >
                  {safetyResult.isSafe ? "No Deadlock Possible" : "Deadlock Risk Detected"}
                </span>
              </div>

              {safetyResult.isSafe ? (
                <div>
                  <p className="text-xs text-emerald-800 mb-2">
                    A safe execution sequence exists without any circular wait:
                  </p>
                  <div className="flex items-center flex-wrap gap-2 py-2 px-3 bg-white rounded border border-emerald-200 font-mono font-bold text-sm text-emerald-900">
                    {safetyResult.safeSequence.map((pid, idx) => (
                      <React.Fragment key={pid}>
                        <span className="bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300">
                          {pid}
                        </span>
                        {idx < safetyResult.safeSequence.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-emerald-600" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-rose-800">
                  {safetyResult.error || "No complete safe sequence could be constructed. Remaining processes have resource requirements exceeding currently available system work capacity."}
                </div>
              )}

              {/* Step Logs Trace */}
              {safetyResult.stepLogs && safetyResult.stepLogs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-emerald-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Banker's Algorithm Step-by-Step Trace
                  </h4>
                  <div className="space-y-1.5 text-xs font-mono text-slate-700 bg-white/80 p-3 rounded border border-emerald-200">
                    {safetyResult.stepLogs.map((log) => (
                      <div key={log.step} className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">#{log.step}</span>
                        <span className="font-semibold text-emerald-800">{log.processId}</span>
                        <span>satisfied (Need [{log.need.join(", ")}] ≤ Work [{log.workBefore.join(", ")}])</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 inline" />
                        <span>Reclaimed [{log.alloc.join(", ")}]</span>
                        <span className="text-slate-500">→ New Work: [{log.workAfter.join(", ")}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
