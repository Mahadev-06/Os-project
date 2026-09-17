import React, { useState, useEffect } from "react";
import { BarChart3, Play, AlertCircle, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { runFCFS } from "../algorithms/fcfs";
import { runSJF } from "../algorithms/sjf";
import { runPriority } from "../algorithms/priority";
import { runRoundRobin } from "../algorithms/roundRobin";
import { validateWorkload } from "../utils/schedulingMetrics";

export default function AlgorithmComparison({ processes, quantum, onNavigate }) {
  const [comparisonResults, setComparisonResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (processes.length > 0) {
      handleCompare();
    } else {
      setComparisonResults([]);
    }
  }, [processes.length, quantum]);

  const handleCompare = () => {
    setError(null);

    const validation = validateWorkload(processes);
    if (!validation.isValid) {
      setError(validation.error);
      setComparisonResults([]);
      return;
    }

    try {
      const q = Number(quantum) > 0 ? Number(quantum) : 2;

      const fcfsRes = runFCFS(processes);
      const sjfRes = runSJF(processes);
      const prioRes = runPriority(processes);
      const rrRes = runRoundRobin(processes, q);

      const summary = [
        {
          algorithm: "FCFS",
          name: "First Come First Serve",
          avgWaiting: fcfsRes.metrics.avgWaitingTime,
          avgTurnaround: fcfsRes.metrics.avgTurnaroundTime,
          avgResponse: fcfsRes.metrics.avgResponseTime,
          cpuUtil: fcfsRes.metrics.cpuUtilization,
          throughput: fcfsRes.metrics.throughput,
        },
        {
          algorithm: "SJF",
          name: "Shortest Job First (NP)",
          avgWaiting: sjfRes.metrics.avgWaitingTime,
          avgTurnaround: sjfRes.metrics.avgTurnaroundTime,
          avgResponse: sjfRes.metrics.avgResponseTime,
          cpuUtil: sjfRes.metrics.cpuUtilization,
          throughput: sjfRes.metrics.throughput,
        },
        {
          algorithm: "Priority",
          name: "Priority Scheduling (NP)",
          avgWaiting: prioRes.metrics.avgWaitingTime,
          avgTurnaround: prioRes.metrics.avgTurnaroundTime,
          avgResponse: prioRes.metrics.avgResponseTime,
          cpuUtil: prioRes.metrics.cpuUtilization,
          throughput: prioRes.metrics.throughput,
        },
        {
          algorithm: `Round Robin (q=${q})`,
          name: `Round Robin (q=${q})`,
          avgWaiting: rrRes.metrics.avgWaitingTime,
          avgTurnaround: rrRes.metrics.avgTurnaroundTime,
          avgResponse: rrRes.metrics.avgResponseTime,
          cpuUtil: rrRes.metrics.cpuUtilization,
          throughput: rrRes.metrics.throughput,
        },
      ];

      setComparisonResults(summary);
    } catch (err) {
      console.error("Comparison execution error:", err);
      setError(`Comparison failed: ${err.message}`);
    }
  };

  // Find lowest average waiting time
  const lowestWaitAlgo = comparisonResults.length > 0
    ? [...comparisonResults].sort((a, b) => a.avgWaiting - b.avgWaiting)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleCompare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Compare All Algorithms</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Execution Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {processes.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center text-slate-500">
          <BarChart3 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No workload available for comparison</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Add processes to test how FCFS, SJF, Priority, and Round Robin behave.
          </p>
          <button
            onClick={() => onNavigate("processes")}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
          >
            Go to Process Manager
          </button>
        </div>
      )}

      {/* Results Section */}
      {comparisonResults.length > 0 && (
        <>
          {/* Scientific Finding Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Award className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <span className="font-bold">
                Lowest average waiting time for this workload: {lowestWaitAlgo?.name} ({lowestWaitAlgo?.avgWaiting} units)
              </span>
              <p className="text-blue-700 mt-1">
                Note: Performance depends on the selected workload, burst duration variance, and process arrival intervals.
              </p>
            </div>
          </div>

          {/* Comparative Metrics Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Benchmark Performance Matrix</h3>
              <p className="text-xs text-slate-500">
                Comparison across Average Waiting, Turnaround, Response Time, CPU Utilization, and Throughput
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Algorithm</th>
                    <th className="py-3 px-4 text-center font-mono">Avg Waiting Time</th>
                    <th className="py-3 px-4 text-center font-mono">Avg Turnaround Time</th>
                    <th className="py-3 px-4 text-center font-mono">Avg Response Time</th>
                    <th className="py-3 px-4 text-center font-mono">CPU Utilization</th>
                    <th className="py-3 px-4 text-center font-mono">Throughput</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {comparisonResults.map((row) => {
                    const isLowestWait = row.avgWaiting === lowestWaitAlgo?.avgWaiting;
                    return (
                      <tr key={row.algorithm} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">
                          {row.name}
                        </td>
                        <td
                          className={`py-3 px-4 text-center ${
                            isLowestWait ? "bg-emerald-50 text-emerald-800 font-bold" : "text-slate-700"
                          }`}
                        >
                          {row.avgWaiting} units
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700">
                          {row.avgTurnaround} units
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700">
                          {row.avgResponse} units
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700">
                          {row.cpuUtil}%
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700 font-semibold">
                          {row.throughput} p/u
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simple Recharts Bar Charts (No Gradients) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Average Waiting Time */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">Chart 1: Average Waiting Time</h3>
                <p className="text-xs text-slate-500">Lower values indicate reduced process delay in ready queue</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonResults} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="algorithm"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12px" }}
                      formatter={(val) => [`${val} units`, "Avg Waiting"]}
                    />
                    <Bar dataKey="avgWaiting" fill="#2563eb" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Average Turnaround Time */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">Chart 2: Average Turnaround Time</h3>
                <p className="text-xs text-slate-500">Elapsed time from process arrival to total completion</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonResults} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="algorithm"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12px" }}
                      formatter={(val) => [`${val} units`, "Avg Turnaround"]}
                    />
                    <Bar dataKey="avgTurnaround" fill="#0d9488" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
