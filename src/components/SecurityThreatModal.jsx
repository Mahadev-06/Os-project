import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  X,
  Zap,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  Cpu,
  CheckCircle2,
} from "lucide-react";

export default function SecurityThreatModal({
  isOpen,
  threat,
  onClose,
  onAutoRemediate,
  remediationLogs,
}) {
  const [isFixing, setIsFixing] = useState(false);
  const [fixCompleted, setFixCompleted] = useState(false);

  if (!isOpen || !threat) return null;

  const handleFixClick = () => {
    setIsFixing(true);
    // Simulate real-time automated kernel remediation with a brief realistic delay
    setTimeout(() => {
      onAutoRemediate();
      setIsFixing(false);
      setFixCompleted(true);
    }, 900);
  };

  const handleDismiss = () => {
    setFixCompleted(false);
    setIsFixing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl bg-white rounded-xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          fixCompleted ? "border-emerald-300" : "border-rose-400"
        }`}
      >
        {/* ======================================================== */}
        {/* MODAL HEADER */}
        {/* ======================================================== */}
        <div
          className={`p-4 sm:p-5 flex items-center justify-between border-b ${
            fixCompleted
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-rose-50 border-rose-200 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                fixCompleted
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700 animate-pulse"
              }`}
            >
              {fixCompleted ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <AlertOctagon className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    fixCompleted
                      ? "bg-emerald-200/80 text-emerald-900 border-emerald-300"
                      : "bg-rose-200/80 text-rose-900 border-rose-300 animate-pulse"
                  }`}
                >
                  {fixCompleted ? "Threat Neutralized" : "Critical Security Alert • Threat Level 4"}
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight mt-0.5">
                {fixCompleted ? "System Returned to Secure State" : threat.name || "Kernel Security Intrusion Detected"}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors"
            title="Dismiss popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* MODAL BODY */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {fixCompleted ? (
            /* SUCCESS STATE AFTER REMEDIATION */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-emerald-900">
                  <span className="font-bold text-sm block">Intrusion & Deadlock Cleared Successfully!</span>
                  <p className="leading-relaxed">
                    The rogue background locks were preempted, contested resources returned to the kernel
                    available pool, and Dijkstra's safety algorithm re-calculated a guaranteed safe execution sequence.
                  </p>
                </div>
              </div>

              {/* Step Logs Audit */}
              {remediationLogs && remediationLogs.length > 0 && (
                <div className="bg-slate-900 text-slate-200 rounded-lg p-4 font-mono text-xs space-y-1.5 border border-slate-800">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800">
                    Kernel Remediation Audit Trail:
                  </div>
                  {remediationLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span className="text-slate-300">{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ACTIVE THREAT DETAILS */
            <div className="space-y-4">
              {/* Threat Signature Grid */}
              <div className="bg-rose-50/70 rounded-lg border border-rose-200 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded border border-rose-200/80">
                    <span className="text-slate-500 text-[11px] block font-medium">Offending Process</span>
                    <span className="font-mono font-bold text-rose-900 text-sm">
                      {threat.processId} ({threat.processName})
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-rose-200/80">
                    <span className="text-slate-500 text-[11px] block font-medium">OS Priority Tier</span>
                    <span className="font-mono font-bold text-rose-900 text-sm">
                      {threat.priorityTier || "Priority 4 (Least / Idle Priority)"}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-rose-200/80 sm:col-span-2">
                    <span className="text-slate-500 text-[11px] block font-medium">Contested Mutex Locks Held</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {threat.contestedLocks || "Holding 85% of physical hardware mutexes without yielding"}
                    </span>
                  </div>

                  {threat.starvedProcesses && (
                    <div className="bg-white p-2.5 rounded border border-rose-200/80 sm:col-span-2">
                      <span className="text-slate-500 text-[11px] block font-medium">Starved Real-Time Tasks</span>
                      <span className="font-mono text-xs text-rose-800 font-semibold">
                        {threat.starvedProcesses}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-rose-200/60">
                  <span className="text-[11px] font-bold text-rose-950 uppercase tracking-wider block mb-1">
                    Kernel Anomaly Diagnostic:
                  </span>
                  <p className="text-xs text-rose-900 leading-relaxed font-sans">
                    {threat.description}
                  </p>
                </div>
              </div>

              {/* Recommended Fixes */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Recommended Automated Kernel Mitigation Protocol:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {threat.mitigationPlan ? (
                    threat.mitigationPlan.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <span>Preempt held resources and revoke exclusive mutex lock.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <span>Reclaim allocation units back to system Available pool.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <span>Re-evaluate Dijkstra's safety invariant to restore valid execution sequence.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODAL FOOTER */}
        {/* ======================================================== */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {fixCompleted ? (
            <div className="flex items-center justify-end w-full">
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-sm transition-colors"
              >
                Close & View Safe Matrix →
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleDismiss}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                Dismiss & Inspect Table
              </button>

              <button
                onClick={handleFixClick}
                disabled={isFixing}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 text-amber-300 fill-amber-300 ${isFixing ? "animate-spin" : ""}`} />
                <span>{isFixing ? "Executing Kernel Remediation..." : "⚡ Auto-Remediate & Neutralize Threat"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
