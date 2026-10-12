import React, { useState, useEffect } from "react";
import { Play, AlertCircle, Info, Zap, RefreshCw } from "lucide-react";
import GanttChart from "../components/GanttChart";
import MetricCard from "../components/MetricCard";
import { runFCFS } from "../algorithms/fcfs";
import { runSJF } from "../algorithms/sjf";
import { runPriority } from "../algorithms/priority";
import { runRoundRobin } from "../algorithms/roundRobin";
import { validateWorkload } from "../utils/schedulingMetrics";

const ALGORITHM_EXPLANATIONS = {
  FCFS: {
    name: "First Come First Serve (FCFS)",
    summary: "Processes are executed strictly in order of their arrival.",
    details:
      "Non-preemptive algorithm. Simple and fair, but can lead to the 'Convoy Effect' where shorter processes wait behind long-running processes, increasing average turnaround time.",
  },
  SJF: {
    name: "Shortest Job First (SJF)",
    summary: "Among arrived processes, the process with the shortest burst time is selected.",
    details:
      "Non-preemptive algorithm. Mathematically optimal for minimizing average waiting time, provided burst times are known beforehand.",
  },
  Priority: {
    name: "Priority Scheduling (Non-preemptive)",
    summary: "Among arrived processes, the process with the highest priority is selected.",
    details:
      "In this simulator, lower numerical value signifies higher priority (e.g. 1 > 2 > 3). High priority processes preempt selection among ready candidates.",
  },
  "Round Robin": {
    name: "Round Robin (RR)",
    summary: "Each ready process receives the CPU for a fixed time quantum before rotating through the queue.",
    details:
      "Preemptive time-sliced algorithm designed for multi-tasking systems. Balances response time across all processes. Performance heavily depends on time quantum size.",
  },
};

export default function CpuScheduler({
  processes,
  liveProcesses = [],
  quantum,
  setQuantum,
  selectedAlgorithm,
  setSelectedAlgorithm,
  onRecordMetrics,
  onNavigate,
  onImportLiveProcesses,
  onRestoreDefaults,
}) {
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState(null);

  // Auto-run or clear when workload changes
  useEffect(() => {
    if (processes.length > 0) {
      handleRunScheduler();
    } else {
      setSimulationResult(null);
    }
  }, [selectedAlgorithm, quantum, processes.length]);

  const handleRunScheduler = () => {
    setError(null);

    // 1. Validate Workload
    const validation = validateWorkload(processes);
    if (!validation.isValid) {
      setError(validation.error);
      setSimulationResult(null);
      return;
    }

    // 2. Validate Quantum if Round Robin
    if (selectedAlgorithm === "Round Robin") {
      const q = Number(quantum);
      if (isNaN(q) || !Number.isInteger(q) || q <= 0) {
        setError("Time Quantum must be a positive integer greater than 0 (e.g. 2).");
        return;
      }
    }

    // 3. Execute Selected Algorithm
    try {
      let res;
      switch (selectedAlgorithm) {
        case "FCFS":
          res = runFCFS(processes);
          break;
        case "SJF":
          res = runSJF(processes);
          break;
        case "Priority":
          res = runPriority(processes);
          break;
        case "Round Robin":
          res = runRoundRobin(processes, Number(quantum));
          break;
        default:
          res = runFCFS(processes);
      }

      setSimulationResult(res);
      if (onRecordMetrics) {
        onRecordMetrics(res.metrics);
      }
    } catch (err) {
      console.error("Scheduler execution error:", err);
      setError(`Simulation error: ${err.message}`);
    }
  };

  const explanation = ALGORITHM_EXPLANATIONS[selectedAlgorithm] || ALGORITHM_EXPLANATIONS.FCFS;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Algorithm selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Select Algorithm
              </label>
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="FCFS">First Come First Serve (FCFS)</option>
                <option value="SJF">Shortest Job First (SJF Non-preemptive)</option>
                <option value="Priority">Priority Scheduling (Non-preemptive)</option>
                <option value="Round Robin">Round Robin (RR)</option>
              </select>
            </div>

            {/* Time Quantum for Round Robin */}
            {selectedAlgorithm === "Round Robin" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Time Quantum (q)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantum}
                    onChange={(e) => setQuantum(e.target.value)}
                    className="w-24 px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <span className="text-xs text-slate-500 font-mono">time units</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Workload Action Buttons */}
          <div className="flex items-center gap-2">
            {liveProcesses.length > 0 && onImportLiveProcesses && (
              <button
                onClick={() => onImportLiveProcesses(liveProcesses.slice(0, 4))}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                title="Schedule real Windows applications currently active on PC"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Load Live PC Tasks</span>
              </button>
            )}

            {onRestoreDefaults && (
              <button
                onClick={onRestoreDefaults}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                title="Restore P1-P4 textbook sample data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sample P1–P4</span>
              </button>
            )}

            {/* Run Button */}
            <button
              onClick={handleRunScheduler}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold shadow-sm transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Run Scheduler</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Execution Blocked</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Input Workload Preview */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Workload Input Dataset ({processes.length} Processes)
          </h3>
          <button
            onClick={() => onNavigate("processes")}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Edit in Process Manager →
          </button>
        </div>

        {processes.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded text-center text-xs text-slate-500">
            No processes available. Add a process or click "Load Live PC Tasks".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-sans font-semibold">
                  <th className="py-2 px-3">PID / Task</th>
                  <th className="py-2 px-3">Arrival Time</th>
                  <th className="py-2 px-3">Burst Time</th>
                  <th className="py-2 px-3">Priority (Lower=High)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-slate-900">{p.id}</td>
                    <td className="py-2 px-3 text-slate-700">{p.arrivalTime}</td>
                    <td className="py-2 px-3 text-slate-700">{p.burstTime}</td>
                    <td className="py-2 px-3 text-slate-700">{p.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simulation Results (Gantt Chart & Metrics) */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Gantt Chart */}
          <GanttChart timeline={simulationResult.timeline} />

          {/* Metric Cards Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MetricCard
              label="Avg Waiting Time"
              value={simulationResult.metrics.avgWaitingTime}
              unit="units"
              description="Average queue wait duration"
              highlight={true}
            />
            <MetricCard
              label="Avg Turnaround Time"
              value={simulationResult.metrics.avgTurnaroundTime}
              unit="units"
              description="Arrival to completion time"
            />
            <MetricCard
              label="Avg Response Time"
              value={simulationResult.metrics.avgResponseTime}
              unit="units"
              description="Arrival to first CPU dispatch"
            />
            <MetricCard
              label="CPU Utilization"
              value={`${simulationResult.metrics.cpuUtilization}%`}
              description={`Busy: ${simulationResult.metrics.busyTime}u | Idle: ${simulationResult.metrics.idleTime}u`}
            />
            <MetricCard
              label="Throughput"
              value={simulationResult.metrics.throughput}
              unit="p/u"
              description="Processes finished per time unit"
            />
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Process Execution Results</h3>
                <p className="text-xs text-slate-500">
                  Computed schedule milestones and performance metrics
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-4">PID</th>
                    <th className="py-2.5 px-4 font-mono text-center">Arrival</th>
                    <th className="py-2.5 px-4 font-mono text-center">Burst</th>
                    <th className="py-2.5 px-4 font-mono text-center">Start</th>
                    <th className="py-2.5 px-4 font-mono text-center">Completion</th>
                    <th className="py-2.5 px-4 font-mono text-center bg-blue-50/50 text-blue-900">Waiting</th>
                    <th className="py-2.5 px-4 font-mono text-center">Turnaround</th>
                    <th className="py-2.5 px-4 font-mono text-center">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {simulationResult.processResults.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-900 font-sans">{row.id}</td>
                      <td className="py-2.5 px-4 text-center text-slate-700">{row.arrivalTime}</td>
                      <td className="py-2.5 px-4 text-center text-slate-700">{row.burstTime}</td>
                      <td className="py-2.5 px-4 text-center text-slate-700">{row.startTime}</td>
                      <td className="py-2.5 px-4 text-center text-slate-700 font-bold">{row.completionTime}</td>
                      <td className="py-2.5 px-4 text-center text-blue-800 font-bold bg-blue-50/30">
                        {row.waitingTime}
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-700">{row.turnaroundTime}</td>
                      <td className="py-2.5 px-4 text-center text-slate-700">{row.responseTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Explanation Section */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-5">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Algorithm Behavior: {explanation.name}
                </h4>
                <p className="text-xs text-slate-700 font-medium mt-1">{explanation.summary}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{explanation.details}</p>
                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500 space-y-1">
                  <div>Turnaround Time = Completion Time − Arrival Time</div>
                  <div>Waiting Time = Turnaround Time − Burst Time</div>
                  <div>Response Time = First CPU Dispatch Time − Arrival Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
