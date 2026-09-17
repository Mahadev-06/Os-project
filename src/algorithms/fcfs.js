import { computeSummaryMetrics } from "../utils/schedulingMetrics.js";

/**
 * First-Come, First-Served (FCFS) Scheduling Algorithm (Non-preemptive)
 * 
 * Rules:
 * - Orders processes strictly by arrival time.
 * - If arrival times are identical, preserves original input order.
 * - If the CPU is idle before the next process arrives, records an "IDLE" slot.
 */
export function runFCFS(workload) {
  // Clone workload to avoid mutating original objects
  const processes = workload.map((p, idx) => ({
    id: p.id,
    arrivalTime: Number(p.arrivalTime),
    burstTime: Number(p.burstTime),
    priority: Number(p.priority),
    originalIndex: idx,
  }));

  // Stable sort by arrival time, then by original insertion index
  processes.sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }
    return a.originalIndex - b.originalIndex;
  });

  const timeline = [];
  const processResults = [];
  let currentTime = 0;

  for (let i = 0; i < processes.length; i++) {
    const p = processes[i];

    // Check for CPU idle period
    if (currentTime < p.arrivalTime) {
      timeline.push({
        pid: "IDLE",
        start: currentTime,
        end: p.arrivalTime,
        duration: p.arrivalTime - currentTime,
      });
      currentTime = p.arrivalTime;
    }

    const startTime = currentTime;
    const completionTime = startTime + p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = startTime - p.arrivalTime;

    timeline.push({
      pid: p.id,
      start: startTime,
      end: completionTime,
      duration: p.burstTime,
    });

    processResults.push({
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      startTime,
      completionTime,
      waitingTime,
      turnaroundTime,
      responseTime,
    });

    currentTime = completionTime;
  }

  const metrics = computeSummaryMetrics(processResults, timeline);

  return {
    algorithm: "FCFS",
    name: "First Come First Serve",
    timeline,
    processResults,
    metrics,
  };
}
