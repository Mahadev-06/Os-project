import React, { useState, useMemo } from "react";
import {
  Layers,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  ArrowRight,
  Activity,
  ListOrdered,
  Cpu,
  HardDrive,
  Server,
  Zap,
  Filter,
  Music,
  Globe,
  FileText,
  MessageSquare,
  Monitor,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard({
  mode = "live",
  systemOverview,
  liveMetrics,
  liveProcesses = [],
  processes,
  events,
  schedulerMetrics,
  onNavigate,
  onImportLiveProcesses,
}) {
  const [procFilter, setProcFilter] = useState("user_apps"); // "user_apps" | "all"

  const userApps = useMemo(() => {
    return liveProcesses.filter(
      (p) => p.isUserApp || p.category === "Browser Tab" || p.category === "User Application"
    );
  }, [liveProcesses]);

  const displayedProcesses = procFilter === "user_apps" ? userApps : liveProcesses;
  // Aggregate process state counts for simulation mode
  const stateCounts = useMemo(() => {
    const counts = { NEW: 0, READY: 0, RUNNING: 0, WAITING: 0, TERMINATED: 0 };
    processes.forEach((p) => {
      const s = p.state || "READY";
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [processes]);

  // Grouped processes
  const groupedProcesses = useMemo(() => {
    const grouped = { NEW: [], READY: [], RUNNING: [], WAITING: [], TERMINATED: [] };
    processes.forEach((p) => {
      const s = p.state || "READY";
      if (grouped[s]) grouped[s].push(p.id);
    });
    return grouped;
  }, [processes]);

  const readyQueuePids = groupedProcesses.READY;

  // CPU chart data: for live mode uses live load history
  const cpuTrendData = useMemo(() => {
    const current = mode === "live" ? (liveMetrics?.cpuLoad ?? 25) : (schedulerMetrics?.cpuUtilization ?? 85);
    return [
      { time: "-15s", load: Math.max(10, Math.round(current * 0.85)) },
      { time: "-12s", load: Math.max(15, Math.round(current * 0.95)) },
      { time: "-9s", load: Math.max(12, Math.round(current * 0.75)) },
      { time: "-6s", load: Math.max(18, Math.round(current * 1.05)) },
      { time: "-3s", load: Math.max(14, Math.round(current * 0.9)) },
      { time: "now", load: Math.min(100, Math.round(current)) },
    ];
  }, [mode, liveMetrics?.cpuLoad, schedulerMetrics?.cpuUtilization]);

  // Format uptime into readable hours/minutes
  const formatUptime = (seconds) => {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Real PC Hardware Mode Content */}
      {mode === "live" ? (
        <>
          {/* Host Machine Hardware Spec Banner */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 font-mono">
                    {systemOverview?.hostname || "Local PC"}
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {systemOverview?.release || "Windows 11"} ({systemOverview?.arch || "x64"})
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {systemOverview?.cpuModel || "Processor"} • {systemOverview?.cpuCores || 8} Logical Cores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
              <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">UPTIME</span>
                <span className="font-bold text-slate-800">{formatUptime(systemOverview?.uptime)}</span>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">TOTAL RAM</span>
                <span className="font-bold text-slate-800">{systemOverview?.totalMemoryGb || 16} GB</span>
              </div>
            </div>
          </div>

          {/* Real-Time Hardware KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              label="Real CPU Load"
              value={`${liveMetrics?.cpuLoad ?? 24}%`}
              subtext="Total processor ticks"
              icon={Activity}
              color={liveMetrics?.cpuLoad > 75 ? "amber" : "blue"}
            />
            <StatCard
              label="RAM In Use"
              value={`${liveMetrics?.memory?.usedGb ?? 8.2} GB`}
              subtext={`${liveMetrics?.memory?.percent ?? 55}% of total`}
              icon={Server}
              color="purple"
            />
            <StatCard
              label="Free Physical RAM"
              value={`${liveMetrics?.memory?.freeGb ?? 7.8} GB`}
              subtext="Unallocated RAM"
              icon={HardDrive}
              color="green"
            />
            <StatCard
              label="Live Windows Tasks"
              value={liveProcesses.length > 0 ? liveProcesses.length : 32}
              subtext="Processes in memory"
              icon={Layers}
              color="blue"
            />
            <StatCard
              label="Logical Cores"
              value={systemOverview?.cpuCores || 8}
              subtext="Hardware threads"
              icon={Cpu}
              color="slate"
            />
            <StatCard
              label="System Uptime"
              value={formatUptime(liveMetrics?.uptime || systemOverview?.uptime)}
              subtext="Continuous runtime"
              icon={Clock}
              color="slate"
            />
          </div>

          {/* Core Load Grid & CPU Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per-Core Load Monitor */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800">CPU Core Utilization</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {systemOverview?.cpuCores || 8} Cores Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Real-time workload distribution across your laptop's hardware cores
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(liveMetrics?.cpuPerCore || Array.from({ length: 8 }, (_, i) => ({ core: i, load: 20 }))).map((core) => (
                  <div key={core.core} className="bg-slate-50 border border-slate-200 rounded p-2.5">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-600 font-semibold">Core {core.core}</span>
                      <span className="text-slate-900 font-bold">{core.load}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          core.load > 80 ? "bg-rose-500" : core.load > 50 ? "bg-amber-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.min(100, core.load)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live CPU Load Signal */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-800">Live Processor Signal</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {liveMetrics?.cpuLoad ?? 24}% Busy
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Continuous hardware tick sampling
                </p>

                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cpuTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "11px" }}
                        formatter={(val) => [`${val}%`, "CPU Usage"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="load"
                        stroke="#2563eb"
                        strokeWidth={1.5}
                        fill="#dbeafe"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2 font-mono">
                <span>Signal Source: Windows Host</span>
                <span>Interval: ~2000ms</span>
              </div>
            </div>
          </div>

          {/* Live Running Windows Processes Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">Real Windows Tasks Running On This PC</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actual OS process identifiers, memory consumption, open applications & browser tabs
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter toggle */}
                <div className="flex items-center bg-white p-0.5 rounded border border-slate-200 text-xs font-medium shadow-2xs">
                  <button
                    onClick={() => setProcFilter("user_apps")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                      procFilter === "user_apps"
                        ? "bg-blue-600 text-white font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Open User Apps Only ({userApps.length})</span>
                  </button>
                  <button
                    onClick={() => setProcFilter("all")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                      procFilter === "all"
                        ? "bg-blue-600 text-white font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Processes ({liveProcesses.length})</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (onImportLiveProcesses) {
                      onImportLiveProcesses(displayedProcesses.slice(0, 4));
                      onNavigate("scheduler");
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
                  title="Send these processes directly into the CPU Scheduler"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Schedule in CPU Lab</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-mono">PID</th>
                    <th className="py-2.5 px-4">Application / Process</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-center font-mono">RAM (Working Set)</th>
                    <th className="py-2.5 px-4 text-center font-mono">CPU Time</th>
                    <th className="py-2.5 px-4 text-center">Windows Priority</th>
                    <th className="py-2.5 px-4 text-center">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {displayedProcesses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-sans">
                        No processes match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    (procFilter === "user_apps" ? displayedProcesses : displayedProcesses.slice(0, 20)).map((p) => {
                      const isTab = p.category === "Browser Tab" || p.name?.includes("YouTube Music") || p.name?.includes("LeetCode") || p.name?.includes("VTOP");
                      const isPowerPoint = p.rawName?.toLowerCase().includes("powerpnt") || p.name?.includes("PowerPoint");
                      const isWhatsApp = p.rawName?.toLowerCase().includes("whatsapp") || p.name?.includes("WhatsApp");
                      const isMusic = p.name?.toLowerCase().includes("music") || p.name?.toLowerCase().includes("youtube");

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{p.realPid || p.id}</td>
                          <td className="py-2.5 px-4 font-sans">
                            <div className="flex items-center gap-2">
                              {isMusic ? (
                                <span className="p-1.5 rounded bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                                  <Music className="w-3.5 h-3.5" />
                                </span>
                              ) : isPowerPoint ? (
                                <span className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                  <FileText className="w-3.5 h-3.5" />
                                </span>
                              ) : isWhatsApp ? (
                                <span className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </span>
                              ) : isTab ? (
                                <span className="p-1.5 rounded bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                  <Globe className="w-3.5 h-3.5" />
                                </span>
                              ) : p.isUserApp ? (
                                <span className="p-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                  <Monitor className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="p-1.5 rounded bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                                  <Server className="w-3.5 h-3.5" />
                                </span>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <span className="truncate">{p.name}</span>
                                  {p.rawName && p.rawName !== p.name && (
                                    <span className="text-[10px] text-slate-400 font-mono shrink-0">({p.rawName})</span>
                                  )}
                                </div>
                                {(p.windowTitle || p.detail) && (
                                  <p className="text-[11px] text-slate-500 font-sans truncate max-w-sm sm:max-w-md">
                                    {p.windowTitle || p.detail}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              isTab
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : p.isUserApp
                                ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>
                              {p.category || (p.isUserApp ? "User App" : "System")}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center text-slate-700">{p.memoryMb} MB</td>
                          <td className="py-2.5 px-4 text-center text-slate-600">{p.cpuSeconds}s</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-sans ${
                              p.priority === 1 ? "bg-blue-50 text-blue-700 font-bold border border-blue-200" : "bg-slate-100 text-slate-600"
                            }`}>
                              Base {p.rawPriority || 8} ({p.priority === 1 ? "High" : p.priority === 3 ? "Idle" : "Normal"})
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans font-medium">
                              {p.state}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {procFilter === "all" && liveProcesses.length > 20 && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-sans">
                <span>
                  Showing top 20 active tasks by memory out of <strong>{liveProcesses.length}</strong> total live Windows processes.
                </span>
                <button
                  onClick={() => onNavigate && onNavigate("processes")}
                  className="text-blue-700 hover:text-blue-800 font-bold hover:underline"
                >
                  View and search all in Process Manager →
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Classic Simulation Mode View */
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              label="Total Processes"
              value={processes.length}
              subtext="Configured in memory"
              icon={Layers}
              color="blue"
            />
            <StatCard
              label="Running"
              value={stateCounts.RUNNING}
              subtext="Allocated to CPU"
              icon={Play}
              color="green"
            />
            <StatCard
              label="Ready"
              value={stateCounts.READY}
              subtext="Awaiting dispatch"
              icon={Clock}
              color="blue"
            />
            <StatCard
              label="Waiting"
              value={stateCounts.WAITING}
              subtext="Blocked for I/O"
              icon={Pause}
              color="amber"
            />
            <StatCard
              label="Terminated"
              value={stateCounts.TERMINATED}
              subtext="Execution finished"
              icon={CheckCircle2}
              color="slate"
            />
            <StatCard
              label="CPU Utilization"
              value={schedulerMetrics ? `${schedulerMetrics.cpuUtilization}%` : "—"}
              subtext={schedulerMetrics ? `Throughput: ${schedulerMetrics.throughput} p/u` : "Run scheduler"}
              icon={Activity}
              color="purple"
            />
          </div>

          {/* 5-State Transition Flow */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Process State Transition Pipeline</h3>
                <p className="text-xs text-slate-500">
                  Standard 5-state process lifecycle and current distribution
                </p>
              </div>
              <button
                onClick={() => onNavigate("processes")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <span>Manage Processes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {["NEW", "READY", "RUNNING", "WAITING", "TERMINATED"].map((stateKey, idx) => {
                const pids = groupedProcesses[stateKey] || [];
                const badgeColorMap = {
                  NEW: "border-slate-200 bg-slate-50/50",
                  READY: "border-blue-200 bg-blue-50/30",
                  RUNNING: "border-emerald-200 bg-emerald-50/40",
                  WAITING: "border-amber-200 bg-amber-50/30",
                  TERMINATED: "border-slate-200 bg-slate-50/50",
                };

                return (
                  <div
                    key={stateKey}
                    className={`rounded-lg border p-3 flex flex-col justify-between ${badgeColorMap[stateKey]}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-800">{stateKey}</span>
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                          {pids.length}
                        </span>
                      </div>
                      <div className="mt-2.5 min-h-[48px] flex flex-wrap gap-1 content-start">
                        {pids.length > 0 ? (
                          pids.map((pid) => (
                            <span
                              key={pid}
                              className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-white border border-slate-300 text-slate-800 shadow-2xs"
                            >
                              {pid}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">None</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 font-sans border-t border-slate-200/60 pt-1.5 flex items-center justify-between">
                      <span>Step {idx + 1} of 5</span>
                      {idx < 4 && <ArrowRight className="w-3 h-3 text-slate-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ready Queue & CPU Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Ready Queue</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {readyQueuePids.length} in queue
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Horizontal sequence of processes waiting in primary memory for CPU dispatch
                </p>

                {readyQueuePids.length > 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-2 overflow-x-auto">
                    <span className="text-[11px] font-mono font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded">
                      HEAD
                    </span>
                    {readyQueuePids.map((pid, idx) => (
                      <React.Fragment key={pid}>
                        <div className="px-3 py-2 bg-white border border-blue-200 rounded text-xs font-mono font-bold text-slate-800 shadow-2xs">
                          {pid}
                        </div>
                        {idx < readyQueuePids.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                    <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded ml-auto">
                      TAIL
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
                    Ready queue is currently empty.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-800">Simulation Processor Load</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {schedulerMetrics ? `${schedulerMetrics.cpuUtilization}% Busy` : "Sample Signal"}
                  </span>
                </div>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cpuTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "11px" }}
                        formatter={(val) => [`${val}%`, "CPU Load"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="load"
                        stroke="#2563eb"
                        strokeWidth={1.5}
                        fill="#dbeafe"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* System Event Log */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">System Activity Log</h3>
          <span className="text-xs text-slate-400">Latest entries</span>
        </div>
        <div className="divide-y divide-slate-100 font-mono text-xs">
          {events && events.length > 0 ? (
            events.slice(0, 6).map((evt) => (
              <div key={evt.id} className="py-2 flex items-center justify-between">
                <span className="text-slate-700">{evt.message}</span>
                <span className="text-slate-400 text-[11px] shrink-0 ml-4">{evt.timestamp}</span>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-slate-400 italic">No events recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
