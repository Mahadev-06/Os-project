import React, { useMemo } from "react";
import {
  Layers,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  ArrowRight,
  Activity,
  ListOrdered,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard({
  processes,
  events,
  schedulerMetrics,
  onNavigate,
}) {
  // Aggregate process state counts
  const stateCounts = useMemo(() => {
    const counts = { NEW: 0, READY: 0, RUNNING: 0, WAITING: 0, TERMINATED: 0 };
    processes.forEach((p) => {
      const s = p.state || "READY";
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [processes]);

  // Processes grouped by state
  const groupedProcesses = useMemo(() => {
    const grouped = { NEW: [], READY: [], RUNNING: [], WAITING: [], TERMINATED: [] };
    processes.forEach((p) => {
      const s = p.state || "READY";
      if (grouped[s]) grouped[s].push(p.id);
    });
    return grouped;
  }, [processes]);

  // Ready queue processes
  const readyQueuePids = groupedProcesses.READY;

  // CPU activity chart sample data
  const cpuActivityData = useMemo(() => {
    const util = schedulerMetrics?.cpuUtilization || 85;
    return [
      { time: "t-6", load: Math.max(20, Math.round(util * 0.7)) },
      { time: "t-5", load: Math.max(30, Math.round(util * 0.85)) },
      { time: "t-4", load: Math.max(25, Math.round(util * 0.65)) },
      { time: "t-3", load: Math.max(45, Math.round(util * 0.95)) },
      { time: "t-2", load: Math.max(35, Math.round(util * 0.8)) },
      { time: "t-1", load: Math.max(50, Math.round(util * 1.0)) },
      { time: "now", load: Math.min(100, Math.round(util)) },
    ];
  }, [schedulerMetrics]);

  return (
    <div className="space-y-6">
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

      {/* Process State Flow & Grouping */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
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

        {/* 5-State Flow Cards */}
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

      {/* Ready Queue & CPU Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ready Queue Visualizer */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
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
                Ready queue is currently empty. Transition processes to READY state in Process Manager.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Scheduling readiness: Stable</span>
            <button
              onClick={() => onNavigate("scheduler")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Simulate in CPU Scheduler →
            </button>
          </div>
        </div>

        {/* Minimal CPU Activity Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">CPU Activity & Utilization</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {schedulerMetrics ? `${schedulerMetrics.cpuUtilization}% Busy` : "Sample Signal"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Processor workload trend over recent simulation intervals
            </p>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuActivityData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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

          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2 font-mono">
            <span>Sampling Window: 7 cycles</span>
            <span>Target: &gt; 80% Utilization</span>
          </div>
        </div>
      </div>

      {/* Recent Events Log */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">System Event Log</h3>
          <span className="text-xs text-slate-400">Latest 10 entries</span>
        </div>
        <div className="divide-y divide-slate-100 font-mono text-xs">
          {events && events.length > 0 ? (
            events.slice(0, 10).map((evt) => (
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
