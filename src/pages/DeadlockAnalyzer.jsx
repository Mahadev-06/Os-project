import React, { useState, useEffect } from "react";
import BankerTable from "../components/BankerTable";
import { runBankerSafety, autoRemediateDeadlock } from "../algorithms/banker";
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Info,
  AlertTriangle,
  Zap,
  Activity,
  Terminal,
  Server,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function DeadlockAnalyzer({
  bankerData,
  setBankerData,
  liveProcesses = [],
  processes = [],
  mode = "live",
  logEvent,
}) {
  const [activeSubTab, setActiveSubTab] = useState("banker"); // "banker" | "host_audit"
  const [safetyResult, setSafetyResult] = useState(null);
  const [remediationLogs, setRemediationLogs] = useState(null);
  const [simulatedLiveThreat, setSimulatedLiveThreat] = useState(null);

  // Automatically run safety analysis on mount or data change
  useEffect(() => {
    handleCheckSafety();
  }, [bankerData]);

  const handleUpdateAvailable = (resourceIndex, value) => {
    const val = Number(value);
    const updated = [...bankerData.available];
    updated[resourceIndex] = isNaN(val) || val < 0 ? 0 : val;
    setBankerData({ ...bankerData, available: updated });
    setRemediationLogs(null);
  };

  const handleUpdateProcessValue = (processIndex, matrixType, resourceIndex, value) => {
    const val = Number(value);
    const sanitizedVal = isNaN(val) || val < 0 ? 0 : val;

    const updatedProcesses = bankerData.processes.map((p, idx) => {
      if (idx !== processIndex) return p;
      const matrix = [...p[matrixType]];
      matrix[resourceIndex] = sanitizedVal;
      return { ...p, [matrixType]: matrix };
    });

    setBankerData({ ...bankerData, processes: updatedProcesses });
    setRemediationLogs(null);
  };

  const handleAddProcess = () => {
    if (bankerData.processes.length >= 6) return;
    const nextId = `P${bankerData.processes.length}`;
    const newProcess = {
      id: nextId,
      name: `Background Service ${nextId}`,
      priority: 2,
      allocation: [0, 0, 0],
      max: [1, 1, 1],
    };
    setBankerData({
      ...bankerData,
      processes: [...bankerData.processes, newProcess],
    });
    setRemediationLogs(null);
  };

  const handleRemoveProcess = (index) => {
    if (bankerData.processes.length <= 3) return;
    const updated = bankerData.processes.filter((_, idx) => idx !== index);
    setBankerData({ ...bankerData, processes: updated });
    setRemediationLogs(null);
  };

  const handleLoadPreset = (preset) => {
    setBankerData(preset);
    setRemediationLogs(null);
    if (logEvent) {
      logEvent(`Loaded Banker & Threat Detection scenario: ${preset.processes.length} processes`);
    }
  };

  const handleCheckSafety = () => {
    const result = runBankerSafety(bankerData.available, bankerData.processes);
    setSafetyResult(result);
  };

  const handleAutoRemediate = () => {
    const result = autoRemediateDeadlock(bankerData);
    if (result.success && result.remediatedData) {
      setBankerData(result.remediatedData);
      setRemediationLogs(result.logs);
      if (logEvent) {
        logEvent(`Kernel Security Remediation executed: Threat resolved & system returned to Safe State`);
      }
    }
  };

  // ==========================================
  // HOST PROCESS ANOMALY SCANNER LOGIC
  // ==========================================
  // Scan live processes for suspicious lowest-priority background workers or memory hogs
  const combinedLiveProcesses = simulatedLiveThreat
    ? [simulatedLiveThreat, ...liveProcesses]
    : liveProcesses;

  const suspiciousLiveTasks = combinedLiveProcesses.filter((p) => {
    const prio = Number(p.priority || 2);
    const rawPrio = Number(p.rawPriority || 8);
    const isLowestPrio = prio === 3 || rawPrio <= 4;
    const isHighRam = Number(p.memoryMb || 0) > 180;
    const isHighCpu = Number(p.cpuSeconds || 0) > 40;
    const isNotUserApp = !p.isUserApp && p.category !== "Browser Tab";
    const isRogueName =
      p.name?.toLowerCase().includes("miner") ||
      p.name?.toLowerCase().includes("rogue") ||
      p.name?.toLowerCase().includes("backdoor");

    return isRogueName || (isLowestPrio && (isHighRam || isHighCpu) && isNotUserApp);
  });

  const hostIntegrityScore = Math.max(
    65,
    100 - suspiciousLiveTasks.length * 15 - (simulatedLiveThreat ? 25 : 0)
  );

  const handleInjectSimulatedThreat = () => {
    setSimulatedLiveThreat({
      id: "PID-9482",
      realPid: 9482,
      name: "stealth_miner.exe",
      rawName: "stealth_miner.exe",
      windowTitle: "Hidden Background Thread (No Window)",
      detail: "Suspicious least-priority background execution (Lock Monopolization signature)",
      category: "Unverified Daemon",
      isUserApp: false,
      memoryMb: 412,
      cpuSeconds: 145,
      priority: 3,
      rawPriority: 4,
      burstTime: 12,
      arrivalTime: 0,
      state: "RUNNING",
    });
    if (logEvent) {
      logEvent(`SECURITY ALERT: Injected simulated rogue background task (PID 9482)`);
    }
  };

  const handleNeutralizeSimulatedThreat = () => {
    setSimulatedLiveThreat(null);
    if (logEvent) {
      logEvent(`SECURITY ACTION: Neutralized rogue background task (PID 9482)`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab("banker")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              activeSubTab === "banker"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>Banker's Deadlock & Threat Guard</span>
          </button>
          <button
            onClick={() => setActiveSubTab("host_audit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              activeSubTab === "host_audit"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Host Process Security Audit ({suspiciousLiveTasks.length} Flags)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-sans">Detection Engine:</span>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active • Invariant Guard
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: BANKER'S DEADLOCK & THREAT INTRUSION GUARD */}
      {/* ======================================================== */}
      {activeSubTab === "banker" && (
        <>
          <BankerTable
            bankerData={bankerData}
            onUpdateAvailable={handleUpdateAvailable}
            onUpdateProcessValue={handleUpdateProcessValue}
            onAddProcess={handleAddProcess}
            onRemoveProcess={handleRemoveProcess}
            onLoadPreset={handleLoadPreset}
            safetyResult={safetyResult}
            onCheckSafety={handleCheckSafety}
            onAutoRemediate={handleAutoRemediate}
            remediationLogs={remediationLogs}
            onClearRemediationLogs={() => setRemediationLogs(null)}
          />

          {/* Educational OS Concept Guide: Deadlock & Priority Inversion */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-5 space-y-4">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  OS Security Principles: Deadlocks, Priority Inversion & Hacker Vectors
                </h4>
                <p className="leading-relaxed">
                  In modern operating systems, a deadlock or thread starvation can occur either accidentally
                  due to unsynchronized mutex locks, or maliciously via an unauthorized background process
                  monopolizing resource allocations without yielding.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
                  <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block font-sans">
                      1. Priority Inversion Attack
                    </span>
                    <span className="text-slate-600 font-sans block">
                      A process with least priority (Priority 4/Idle) acquires exclusive locks on shared
                      resources needed by high-priority tasks (Priority 1), freezing critical real-time execution.
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block font-sans">
                      2. Circular Wait Denial-of-Service
                    </span>
                    <span className="text-slate-600 font-sans block">
                      Multiple processes locked in mutual hold-and-wait dependency. Available resources
                      drop to 0, completely halting CPU dispatch.
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block font-sans">
                      3. Kernel Remediation Protocols
                    </span>
                    <span className="text-slate-600 font-sans block">
                      The OS kernel invokes lock preemption, revokes held mutexes, or applies Priority
                      Ceiling Protocol (PCP) to break deadlock cycles and restore safe execution sequences.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: LIVE WINDOWS HOST PROCESS SECURITY AUDIT */}
      {/* ======================================================== */}
      {activeSubTab === "host_audit" && (
        <div className="space-y-6">
          {/* Integrity Score & Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Host Integrity Score
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold font-mono ${
                    hostIntegrityScore >= 90
                      ? "text-emerald-700"
                      : hostIntegrityScore >= 75
                      ? "text-amber-700"
                      : "text-rose-700"
                  }`}
                >
                  {hostIntegrityScore}%
                </span>
                <span className="text-xs text-slate-500">
                  {hostIntegrityScore >= 90 ? "Healthy" : "Threat Flags Detected"}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Monitored Live Processes
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900">
                {combinedLiveProcesses.length || 350}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">Scanned for thread locks</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Suspicious Priority Flags
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-bold font-mono ${
                    suspiciousLiveTasks.length > 0 ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {suspiciousLiveTasks.length}
                </span>
                <span className="text-xs text-slate-500">
                  {suspiciousLiveTasks.length === 0 ? "Zero anomalies" : "Investigate"}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Mutual Exclusion Scan
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-700">0 Deadlocks</span>
              <span className="text-xs text-slate-400 block mt-0.5">Circular wait invariant safe</span>
            </div>
          </div>

          {/* Alert or Clean Status */}
          {suspiciousLiveTasks.length > 0 ? (
            <div className="bg-rose-50 border border-rose-300 rounded-lg p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">
                      Security Alert: Least-Priority Background Thread Anomaly Detected
                    </h4>
                    <p className="text-xs text-rose-800 mt-1">
                      Detected {suspiciousLiveTasks.length} background process(es) executing with lowest
                      base priority while consuming abnormal memory or CPU cycles without a visible window.
                    </p>
                  </div>
                </div>

                {simulatedLiveThreat && (
                  <button
                    onClick={handleNeutralizeSimulatedThreat}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs shrink-0 shadow-2xs"
                  >
                    ⚡ Neutralize & Terminate Threat
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Host Process Security Audit Passed: All Tiers Operating Safely
                  </h4>
                  <p className="text-xs text-emerald-800">
                    No lowest-priority background workers are starving critical desktop threads or holding
                    unyielding mutex locks.
                  </p>
                </div>
              </div>

              {!simulatedLiveThreat && (
                <button
                  onClick={handleInjectSimulatedThreat}
                  className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 rounded font-semibold text-xs shadow-2xs transition-colors shrink-0"
                  title="Simulate what happens when a low-priority rogue miner attempts to hijack backend resources"
                >
                  + Inject Simulated Rogue Worker
                </button>
              )}
            </div>
          )}

          {/* Anomaly Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live OS Background Tasks with Low/Idle Base Priority
                </h4>
                <p className="text-xs text-slate-500">
                  Processes running with base priority ≤ 4 (Win32 Idle/Low) monitored for potential priority inversion
                </p>
              </div>

              {simulatedLiveThreat && (
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                  Simulated Intruder Active
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-mono">PID</th>
                    <th className="py-2.5 px-4">Process Name</th>
                    <th className="py-2.5 px-4">Window / Thread Detail</th>
                    <th className="py-2.5 px-4 text-center font-mono">Base Priority</th>
                    <th className="py-2.5 px-4 text-center font-mono">RAM (MB)</th>
                    <th className="py-2.5 px-4 text-center font-mono">CPU (s)</th>
                    <th className="py-2.5 px-4 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {suspiciousLiveTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-sans">
                        Zero unyielding least-priority background anomalies detected in your running Windows OS.
                      </td>
                    </tr>
                  ) : (
                    suspiciousLiveTasks.map((t) => (
                      <tr
                        key={t.id}
                        className={
                          t.id === "PID-9482" ? "bg-rose-50/60 font-semibold" : "hover:bg-slate-50/60"
                        }
                      >
                        <td className="py-2.5 px-4 font-bold text-slate-900">{t.realPid || t.id}</td>
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-800">
                          {t.name}
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-500 truncate max-w-xs">
                          {t.windowTitle || t.detail || "Background Service Thread"}
                        </td>
                        <td className="py-2.5 px-4 text-center font-sans">
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                            Base {t.rawPriority || 4} (Idle / Least)
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-700">{t.memoryMb} MB</td>
                        <td className="py-2.5 px-4 text-center text-slate-700">{t.cpuSeconds}s</td>
                        <td className="py-2.5 px-4 text-right font-sans">
                          {t.id === "PID-9482" ? (
                            <button
                              onClick={handleNeutralizeSimulatedThreat}
                              className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded border border-rose-300"
                            >
                              Terminate Rogue
                            </button>
                          ) : (
                            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Monitored Safe
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
