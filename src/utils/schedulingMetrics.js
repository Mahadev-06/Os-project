/**
 * Utility functions for calculating CPU scheduling metrics.
 */

export function computeSummaryMetrics(processResults, timeline) {
  if (!processResults || processResults.length === 0) {
    return {
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      throughput: 0,
      totalTime: 0,
      busyTime: 0,
      idleTime: 0,
      completedCount: 0,
    };
  }

  const n = processResults.length;
  let totalWaiting = 0;
  let totalTurnaround = 0;
  let totalResponse = 0;

  processResults.forEach((p) => {
    totalWaiting += p.waitingTime;
    totalTurnaround += p.turnaroundTime;
    totalResponse += p.responseTime;
  });

  // Calculate total simulation time from timeline or process completions
  let totalSimulationTime = 0;
  let busyCpuTime = 0;
  let idleCpuTime = 0;

  if (timeline && timeline.length > 0) {
    totalSimulationTime = timeline[timeline.length - 1].end;
    timeline.forEach((slice) => {
      const duration = slice.end - slice.start;
      if (slice.pid === "IDLE") {
        idleCpuTime += duration;
      } else {
        busyCpuTime += duration;
      }
    });
  } else {
    totalSimulationTime = Math.max(...processResults.map((p) => p.completionTime), 0);
    busyCpuTime = processResults.reduce((acc, p) => acc + p.burstTime, 0);
    idleCpuTime = Math.max(0, totalSimulationTime - busyCpuTime);
  }

  const cpuUtilization = totalSimulationTime > 0
    ? (busyCpuTime / totalSimulationTime) * 100
    : 0;

  const throughput = totalSimulationTime > 0
    ? n / totalSimulationTime
    : 0;

  return {
    avgWaitingTime: Number((totalWaiting / n).toFixed(2)),
    avgTurnaroundTime: Number((totalTurnaround / n).toFixed(2)),
    avgResponseTime: Number((totalResponse / n).toFixed(2)),
    cpuUtilization: Number(cpuUtilization.toFixed(2)),
    throughput: Number(throughput.toFixed(3)),
    totalTime: totalSimulationTime,
    busyTime: busyCpuTime,
    idleTime: idleCpuTime,
    completedCount: n,
  };
}

/**
 * Validates a workload array before scheduling.
 * Returns { isValid: boolean, error: string | null }
 */
export function validateWorkload(processes) {
  if (!processes || processes.length === 0) {
    return { isValid: false, error: "No processes available to schedule. Please add processes first." };
  }

  const pids = new Set();
  for (let i = 0; i < processes.length; i++) {
    const p = processes[i];
    if (!p.id || String(p.id).trim() === "") {
      return { isValid: false, error: `Process at index ${i} has an empty PID.` };
    }
    if (pids.has(p.id)) {
      return { isValid: false, error: `Duplicate Process ID detected: "${p.id}". PIDs must be unique.` };
    }
    pids.add(p.id);

    if (p.arrivalTime === undefined || p.arrivalTime === null || isNaN(p.arrivalTime) || Number(p.arrivalTime) < 0) {
      return { isValid: false, error: `Process ${p.id} has an invalid arrival time: must be an integer >= 0.` };
    }
    if (p.burstTime === undefined || p.burstTime === null || isNaN(p.burstTime) || Number(p.burstTime) <= 0) {
      return { isValid: false, error: `Process ${p.id} has an invalid burst time: must be an integer > 0.` };
    }
    if (p.priority === undefined || p.priority === null || isNaN(p.priority) || Number(p.priority) < 1) {
      return { isValid: false, error: `Process ${p.id} has an invalid priority: must be an integer >= 1.` };
    }
  }

  return { isValid: true, error: null };
}
