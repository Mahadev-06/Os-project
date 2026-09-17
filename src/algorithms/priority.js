import { computeSummaryMetrics } from "../utils/schedulingMetrics.js";

/**
 * Priority Scheduling Algorithm (Non-preemptive)
 * 
 * Rules:
 * - Lower integer value represents higher priority (e.g., Priority 1 > Priority 2).
 * - At currentTime, considers only arrived processes (arrivalTime <= currentTime).
 * - Selects process with highest priority (lowest numerical priority value).
 * - Tie-breaking:
 *    1. Earlier arrivalTime
 *    2. Original insertion index
 * - Idle periods handled with "IDLE" timeline blocks.
 */
export function runPriority(workload) {
  const remainingProcesses = workload.map((p, idx) => ({
    id: p.id,
    arrivalTime: Number(p.arrivalTime),
    burstTime: Number(p.burstTime),
    priority: Number(p.priority),
    originalIndex: idx,
  }));

  const timeline = [];
  const processResults = [];
  let currentTime = 0;

  while (remainingProcesses.length > 0) {
    // Arrived processes
    const available = remainingProcesses.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      // Idle jump to next arrival
      const nextArrival = Math.min(...remainingProcesses.map((p) => p.arrivalTime));
      timeline.push({
        pid: "IDLE",
        start: currentTime,
        end: nextArrival,
        duration: nextArrival - currentTime,
      });
      currentTime = nextArrival;
      continue;
    }

    // Pick highest priority (lowest number)
    available.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.originalIndex - b.originalIndex;
    });

    const selected = available[0];

    const selectedIndex = remainingProcesses.findIndex((p) => p.id === selected.id);
    remainingProcesses.splice(selectedIndex, 1);

    const startTime = currentTime;
    const completionTime = startTime + selected.burstTime;
    const turnaroundTime = completionTime - selected.arrivalTime;
    const waitingTime = turnaroundTime - selected.burstTime;
    const responseTime = startTime - selected.arrivalTime;

    timeline.push({
      pid: selected.id,
      start: startTime,
      end: completionTime,
      duration: selected.burstTime,
    });

    processResults.push({
      id: selected.id,
      arrivalTime: selected.arrivalTime,
      burstTime: selected.burstTime,
      priority: selected.priority,
      startTime,
      completionTime,
      waitingTime,
      turnaroundTime,
      responseTime,
    });

    currentTime = completionTime;
  }

  // Restore presentation order matching original workload
  processResults.sort((a, b) => {
    const origA = workload.findIndex((p) => p.id === a.id);
    const origB = workload.findIndex((p) => p.id === b.id);
    return origA - origB;
  });

  const metrics = computeSummaryMetrics(processResults, timeline);

  return {
    algorithm: "Priority",
    name: "Priority Scheduling (Non-preemptive)",
    timeline,
    processResults,
    metrics,
  };
}
