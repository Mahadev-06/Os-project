import { computeSummaryMetrics } from "../utils/schedulingMetrics.js";

/**
 * Round Robin (RR) Scheduling Algorithm (Preemptive)
 * 
 * Rules:
 * - Respects arrival times strictly using a FIFO ready queue.
 * - Each process receives up to `quantum` units of CPU time.
 * - Processes arriving while a process is executing are pushed to the ready queue
 *   before the currently running process (if still unfinished) is re-enqueued.
 * - Idle time is accurately tracked when no process is ready.
 * - First CPU acquisition time is recorded to compute Response Time.
 */
export function runRoundRobin(workload, quantum = 2) {
  const q = Number(quantum);
  if (isNaN(q) || q <= 0) {
    throw new Error("Time Quantum must be a positive integer greater than 0.");
  }

  // Clone workload
  const processes = workload.map((p, idx) => ({
    id: p.id,
    arrivalTime: Number(p.arrivalTime),
    burstTime: Number(p.burstTime),
    remainingTime: Number(p.burstTime),
    priority: Number(p.priority),
    originalIndex: idx,
    firstStartTime: null,
    completionTime: 0,
  }));

  // Sort by arrival time, then by original index
  processes.sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }
    return a.originalIndex - b.originalIndex;
  });

  const timeline = [];
  const readyQueue = [];
  let currentTime = 0;
  let completedCount = 0;
  const n = processes.length;

  // Track which processes have arrived and entered the ready queue
  const enqueued = new Array(n).fill(false);

  // Check initial arrivals at currentTime = 0
  for (let i = 0; i < n; i++) {
    if (processes[i].arrivalTime <= currentTime) {
      readyQueue.push(processes[i]);
      enqueued[i] = true;
    }
  }

  // Safety loop guard against infinite execution
  let iterations = 0;
  const maxIterations = 50000;

  while (completedCount < n && iterations < maxIterations) {
    iterations++;

    if (readyQueue.length === 0) {
      // Find next arriving process among unfinished
      const unfinished = processes.filter((p) => p.remainingTime > 0 && !enqueued[processes.indexOf(p)]);
      if (unfinished.length === 0) {
        // All remaining unfinished processes must already be somewhere, or completed
        break;
      }

      const nextArrival = Math.min(...unfinished.map((p) => p.arrivalTime));
      if (nextArrival > currentTime) {
        timeline.push({
          pid: "IDLE",
          start: currentTime,
          end: nextArrival,
          duration: nextArrival - currentTime,
        });
        currentTime = nextArrival;
      }

      // Enqueue processes arriving at new currentTime
      for (let i = 0; i < n; i++) {
        if (!enqueued[i] && processes[i].arrivalTime <= currentTime) {
          readyQueue.push(processes[i]);
          enqueued[i] = true;
        }
      }
      continue;
    }

    const currentProcess = readyQueue.shift();

    // Record first start time if not yet seen
    if (currentProcess.firstStartTime === null) {
      currentProcess.firstStartTime = currentTime;
    }

    const sliceDuration = Math.min(currentProcess.remainingTime, q);
    const sliceStart = currentTime;
    const sliceEnd = sliceStart + sliceDuration;

    timeline.push({
      pid: currentProcess.id,
      start: sliceStart,
      end: sliceEnd,
      duration: sliceDuration,
    });

    currentTime = sliceEnd;
    currentProcess.remainingTime -= sliceDuration;

    // Enqueue any newly arrived processes that arrived during this slice [sliceStart, sliceEnd]
    for (let i = 0; i < n; i++) {
      if (!enqueued[i] && processes[i].arrivalTime <= currentTime) {
        readyQueue.push(processes[i]);
        enqueued[i] = true;
      }
    }

    // If current process still has remaining work, put back in queue
    if (currentProcess.remainingTime > 0) {
      readyQueue.push(currentProcess);
    } else {
      currentProcess.completionTime = currentTime;
      completedCount++;
    }
  }

  // Calculate per-process metrics
  const processResults = processes.map((p) => {
    const turnaroundTime = p.completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = (p.firstStartTime !== null ? p.firstStartTime : p.arrivalTime) - p.arrivalTime;

    return {
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      startTime: p.firstStartTime !== null ? p.firstStartTime : p.arrivalTime,
      completionTime: p.completionTime,
      waitingTime,
      turnaroundTime,
      responseTime,
    };
  });

  // Sort back by original index
  processResults.sort((a, b) => {
    const origA = workload.findIndex((p) => p.id === a.id);
    const origB = workload.findIndex((p) => p.id === b.id);
    return origA - origB;
  });

  const metrics = computeSummaryMetrics(processResults, timeline);

  return {
    algorithm: "Round Robin",
    name: `Round Robin (Quantum = ${q})`,
    quantum: q,
    timeline,
    processResults,
    metrics,
  };
}
