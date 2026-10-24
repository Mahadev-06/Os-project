import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RotateCcw,
  Cpu,
  Lock,
  Unlock,
} from "lucide-react";
import {
  DEFAULT_BANKER_DATA,
  PRIORITY_INVERSION_ATTACK_DATA,
  UNSAFE_BANKER_DATA,
} from "../data/sampleBankerData";

export default function BankerTable({
  bankerData,
  onUpdateAvailable,
  onUpdateProcessValue,
  onUpdateProcessPriority,
  onAddProcess,
  onRemoveProcess,
  onLoadPreset,
  safetyResult,
  onCheckSafety,
  onAutoRemediate,
  remediationLogs = null,
  onClearRemediationLogs,
}) {
  const { resourceNames, available, processes } = bankerData;
  const threat = safetyResult?.threatAnalysis || {};
  const isCritical = threat.threatLevel === "CRITICAL";
  const isElevated = threat.threatLevel === "ELEVATED";
  const isSecure = threat.threatLevel === "SECURE" && safetyResult?.isSafe;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. SECURITY THREAT ALERT & ANOMALY DETECTION BANNER */}
      {/* ======================================================== */}
      {safetyResult && (
        <div
          className={`rounded-lg border p-5 shadow-sm transition-all ${
            isCritical
              ? "bg-rose-50/80 border-rose-300 text-rose-950"
              : isElevated
              ? "bg-amber-50/80 border-amber-300 text-amber-950"
              : "bg-emerald-50/70 border-emerald-300 text-emerald-950"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isCritical
                    ? "bg-rose-100 text-rose-700"
                    : isElevated
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isCritical ? (
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                ) : isElevated ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${
                      isCritical
                        ? "bg-rose-200/80 text-rose-900 border-rose-300 animate-pulse"
                        : isElevated
                        ? "bg-amber-200/80 text-amber-900 border-amber-300"
                        : "bg-emerald-200/80 text-emerald-900 border-emerald-300"
                    }`}
                  >
                    {isCritical
                      ? "Critical Threat: Deadlock / Attack Detected"
                      : isElevated
                      ? "Warning: Priority Inversion Risk"
                      : "System Secure: Zero Deadlocks"}
                  </span>

                  {threat.offendingProcess && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                      Rogue Process: {threat.offendingProcess.id} (Priority {threat.offendingProcess.priority || 4})
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold tracking-tight">
                  {threat.threatType || (isSecure ? "SAFE STATE VERIFIED" : "UNSAFE STATE")}
                </h3>

                <p className="text-xs leading-relaxed max-w-3xl opacity-90 font-sans">
                  {threat.threatDescription}
                </p>

                {/* Recommended Fixes */}
                {threat.recommendations && threat.recommendations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-black/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 opacity-80">
                      Recommended Kernel Remediation:
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                      {threat.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold shrink-0">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 flex flex-col gap-2 self-start lg:self-center">
              {isCritical && (
                <button
                  onClick={onAutoRemediate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>⚡ Auto-Remediate Threat & Fix Deadlock</span>
                </button>
              )}

              {isSecure && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dijkstra's Invariant Satisfied</span>
                </div>
              )}
            </div>
          </div>

          {/* Safe Sequence Banner if safe */}
          {isSecure && safetyResult.safeSequence?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-emerald-200/80">
              <span className="text-xs font-semibold text-emerald-900 block mb-1.5">
                Verified Circular-Wait-Free Execution Sequence:
              </span>
              <div className="flex items-center flex-wrap gap-2 py-2 px-3 bg-white/90 rounded border border-emerald-200 font-mono font-bold text-xs text-emerald-900">
                {safetyResult.safeSequence.map((pid, idx) => (
                  <React.Fragment key={pid}>
                    <span className="bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300">
                      {pid}
                    </span>
                    {idx < safetyResult.safeSequence.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. AUTOMATED REMEDIATION PROGRESS / AUDIT CARD */}
      {/* ======================================================== */}
      {remediationLogs && remediationLogs.length > 0 && (
        <div className="bg-slate-900 text-slate-200 rounded-lg border border-slate-800 p-4 shadow-sm font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Automated Kernel Threat Remediation Audit</span>
            </div>
            {onClearRemediationLogs && (
              <button
                onClick={onClearRemediationLogs}
                className="text-slate-400 hover:text-white text-[11px]"
              >
                Dismiss Log
              </button>
            )}
          </div>
          <div className="space-y-1 text-slate-300">
            {remediationLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✔</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ATTACK PRESET CONTROLS & SCENARIO SELECTOR */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Test Scenarios:
          </span>
          <button
            onClick={() => onLoadPreset(DEFAULT_BANKER_DATA)}
            className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
          >
            🟢 Standard Safe Case (5 Processes)
          </button>
          <button
            onClick={() => onLoadPreset(PRIORITY_INVERSION_ATTACK_DATA)}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
            title="Inject a low-priority rogue process monopolizing locks"
          >
            ⚠️ Rogue Attack: Priority Inversion
          </button>
          <button
            onClick={() => onLoadPreset(UNSAFE_BANKER_DATA)}
            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
            title="Inject circular hold-and-wait deadlock"
          >
            🛑 DoS Attack: Circular Deadlock
          </button>
        </div>

        <div className="flex items-center gap-2">
          {processes.length < 5 && (
            <button
              onClick={onAddProcess}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Process</span>
            </button>
          )}
          <button
            onClick={onCheckSafety}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Check Safety & Audit</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. AVAILABLE RESOURCE VECTOR CONFIGURATION */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Available Resource Vector [A, B, C]
        </h4>
        <div className="flex flex-wrap items-center gap-4">
          {resourceNames.map((res, idx) => (
            <div key={res} className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-700 w-4">{res}:</span>
              <input
                type="number"
                min="0"
                value={available[idx]}
                onChange={(e) => onUpdateAvailable(idx, e.target.value)}
                className="w-16 px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-center"
              />
            </div>
          ))}
          <span className="text-xs text-slate-400 italic">
            Units currently unallocated and free for kernel dispatch
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MATRICES TABLE (Allocation, Maximum, Need & Priority) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4" rowSpan={2}>
                  Process / Thread
                </th>
                <th className="py-3 px-3 text-center border-l border-slate-200" rowSpan={2}>
                  Priority Tier
                </th>
                <th
                  className="py-2 px-4 text-center border-l border-slate-200 bg-slate-100/70"
                  colSpan={3}
                >
                  Allocation Matrix (Held Locks)
                </th>
                <th
                  className="py-2 px-4 text-center border-l border-slate-200 bg-slate-100/70"
                  colSpan={3}
                >
                  Maximum Matrix (Max Claim)
                </th>
                <th
                  className="py-2 px-4 text-center border-l border-slate-200 bg-blue-50/70 text-blue-900"
                  colSpan={3}
                >
                  Need Matrix (Max − Alloc)
                </th>
                <th className="py-3 px-4 text-right" rowSpan={2}>
                  Actions
                </th>
              </tr>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-mono text-slate-500">
                {/* Allocation Cols */}
                {resourceNames.map((r) => (
                  <th key={`alloc-h-${r}`} className="py-1 px-2 text-center border-l border-slate-200">
                    {r}
                  </th>
                ))}
                {/* Max Cols */}
                {resourceNames.map((r) => (
                  <th key={`max-h-${r}`} className="py-1 px-2 text-center border-l border-slate-200">
                    {r}
                  </th>
                ))}
                {/* Need Cols */}
                {resourceNames.map((r) => (
                  <th
                    key={`need-h-${r}`}
                    className="py-1 px-2 text-center border-l border-slate-200 text-blue-800"
                  >
                    {r}
                  </th>
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
                const isOffending = threat.offendingProcess?.id === p.id;
                const isDeadlocked = safetyResult?.deadlockedProcesses?.includes(p.id);

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isOffending
                        ? "bg-rose-50/70"
                        : isDeadlocked
                        ? "bg-amber-50/40"
                        : hasError
                        ? "bg-rose-50/40"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Process Identifier & Name */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        {isOffending ? (
                          <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{p.id}</span>
                            {isOffending && (
                              <span className="text-[10px] font-sans px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded font-bold">
                                Offending Rogue Lock
                              </span>
                            )}
                            {p.isRemediated && (
                              <span className="text-[10px] font-sans px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                                Remediated
                              </span>
                            )}
                          </div>
                          {p.name && (
                            <p className="text-[11px] text-slate-500 truncate max-w-xs">{p.name}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Priority Tier Column */}
                    <td className="py-2.5 px-3 text-center border-l border-slate-100">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          p.priority === 1
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : p.priority === 4 || p.priority >= 3
                            ? "bg-rose-100 text-rose-800 border border-rose-200 font-bold"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        Prio {p.priority || 2}{" "}
                        {p.priority === 1
                          ? "(High)"
                          : p.priority === 4
                          ? "(Idle/Least)"
                          : p.priority === 3
                          ? "(Low)"
                          : "(Normal)"}
                      </span>
                    </td>

                    {/* Allocation Inputs */}
                    {resourceNames.map((_, rIdx) => (
                      <td
                        key={`alloc-${p.id}-${rIdx}`}
                        className="py-1.5 px-2 text-center border-l border-slate-100"
                      >
                        <input
                          type="number"
                          min="0"
                          value={p.allocation[rIdx]}
                          onChange={(e) =>
                            onUpdateProcessValue(pIdx, "allocation", rIdx, e.target.value)
                          }
                          className={`w-14 text-center px-1 py-1 font-mono text-xs border rounded outline-none focus:border-blue-500 ${
                            isOffending
                              ? "border-rose-400 bg-rose-50 font-bold text-rose-900"
                              : "border-slate-300"
                          }`}
                        />
                      </td>
                    ))}

                    {/* Max Inputs */}
                    {resourceNames.map((_, rIdx) => (
                      <td
                        key={`max-${p.id}-${rIdx}`}
                        className="py-1.5 px-2 text-center border-l border-slate-100"
                      >
                        <input
                          type="number"
                          min="0"
                          value={p.max[rIdx]}
                          onChange={(e) =>
                            onUpdateProcessValue(pIdx, "max", rIdx, e.target.value)
                          }
                          className="w-14 text-center px-1 py-1 font-mono text-xs border border-slate-300 rounded outline-none focus:border-blue-500"
                        />
                      </td>
                    ))}

                    {/* Need Display (Auto-calculated) */}
                    {need.map((val, rIdx) => (
                      <td
                        key={`need-${p.id}-${rIdx}`}
                        className="py-1.5 px-2 text-center border-l border-slate-100 bg-blue-50/30"
                      >
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

      {/* ======================================================== */}
      {/* 6. STEP-BY-STEP TRACE */}
      {/* ======================================================== */}
      {safetyResult?.stepLogs && safetyResult.stepLogs.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Banker's Algorithm Step-by-Step Allocation & Release Trace
          </h4>
          <div className="space-y-1.5 text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
            {safetyResult.stepLogs.map((log) => (
              <div key={log.step} className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold">Step #{log.step}:</span>
                <span className="font-semibold text-emerald-800">{log.processId}</span>
                <span>
                  satisfied (Need [{log.need.join(", ")}] ≤ Work [{log.workBefore.join(", ")}])
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 inline" />
                <span>Reclaimed [{log.alloc.join(", ")}]</span>
                <span className="text-slate-500">→ New Work: [{log.workAfter.join(", ")}]</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
