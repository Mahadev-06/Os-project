import { computeSummaryMetrics } from "../utils/schedulingMetrics.js";

/**
 * Shortest Job First (SJF) Scheduling Algorithm (Non-preemptive)
 * 
 * Rules:
 * - At currentTime, only consider processes that have arrived (arrivalTime <= currentTime).
 * - From available processes, pick the one with the smallest burstTime.
 * - Tie-breaking:
 *    1. Earlier arrivalTime
 *    2. Original insertion index
 * - If no arrived processes are ready, insert IDLE block and advance to next arrival.
 */
export function runSJF(workload) {
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
    // Find all processes that have arrived by currentTime
    const available = remainingProcesses.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      // No process has arrived yet; advance time to the earliest arrival among remaining
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

    // Pick process with smallest burst time
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) {
        return a.burstTime - b.burstTime;
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.originalIndex - b.originalIndex;
    });

    const selected = available[0];

    // Remove selected process from remaining list
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

  // Sort processResults back by original input order for consistent table display
  processResults.sort((a, b) => {
    const origA = workload.findIndex((p) => p.id === a.id);
    const origB = workload.findIndex((p) => p.id === b.id);
    return origA - origB;
  });

  const metrics = computeSummaryMetrics(processResults, timeline);

  return {
    algorithm: "SJF",
    name: "Shortest Job First (Non-preemptive)",
    timeline,
    processResults,
    metrics,
  };
}
