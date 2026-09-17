import { runFCFS } from "./src/algorithms/fcfs.js";
import { runSJF } from "./src/algorithms/sjf.js";
import { runPriority } from "./src/algorithms/priority.js";
import { runRoundRobin } from "./src/algorithms/roundRobin.js";
import { runBankerSafety } from "./src/algorithms/banker.js";
import { DEFAULT_BANKER_DATA, UNSAFE_BANKER_DATA } from "./src/data/sampleBankerData.js";

console.log("==========================================");
console.log("RUNNING OS-TASKFLOW ALGORITHM VERIFICATION");
console.log("==========================================\n");

// TEST 1: FCFS with Sample Workload
console.log("--- TEST 1: FCFS Arrival Order Verification ---");
const sampleWorkload = [
  { id: "P1", arrivalTime: 0, burstTime: 5, priority: 2 },
  { id: "P2", arrivalTime: 1, burstTime: 3, priority: 1 },
  { id: "P3", arrivalTime: 2, burstTime: 8, priority: 3 },
  { id: "P4", arrivalTime: 3, burstTime: 4, priority: 2 },
];
const fcfsResult = runFCFS(sampleWorkload);
console.log("FCFS Timeline:", fcfsResult.timeline.map(t => `${t.pid} [${t.start}-${t.end}]`).join(" -> "));
console.log("FCFS Metrics:", fcfsResult.metrics);
// Expected order: P1 [0-5], P2 [5-8], P3 [8-16], P4 [16-20]
if (
  fcfsResult.timeline[0].pid === "P1" &&
  fcfsResult.timeline[1].pid === "P2" &&
  fcfsResult.timeline[2].pid === "P3" &&
  fcfsResult.timeline[3].pid === "P4"
) {
  console.log(">>> TEST 1 PASSED: FCFS respects arrival order correctly.\n");
} else {
  console.error(">>> TEST 1 FAILED!");
  process.exit(1);
}

// TEST 2: SJF with same arrival time
console.log("--- TEST 2: SJF Smallest Burst Selection (Same Arrival) ---");
const sameArrival = [
  { id: "PA", arrivalTime: 0, burstTime: 7, priority: 1 },
  { id: "PB", arrivalTime: 0, burstTime: 2, priority: 1 },
  { id: "PC", arrivalTime: 0, burstTime: 4, priority: 1 },
];
const sjfSameArrival = runSJF(sameArrival);
console.log("SJF Timeline:", sjfSameArrival.timeline.map(t => `${t.pid} [${t.start}-${t.end}]`).join(" -> "));
if (
  sjfSameArrival.timeline[0].pid === "PB" &&
  sjfSameArrival.timeline[1].pid === "PC" &&
  sjfSameArrival.timeline[2].pid === "PA"
) {
  console.log(">>> TEST 2 PASSED: SJF selects smallest burst (PB(2) -> PC(4) -> PA(7)).\n");
} else {
  console.error(">>> TEST 2 FAILED!");
  process.exit(1);
}

// TEST 3: SJF with different arrival times (must NOT pick unarrived process)
console.log("--- TEST 3: SJF Arrival-Aware Selection ---");
// At t=0, only P1 is available (burst 5). Even though P2 has smaller burst (3), it arrives at t=1.
// So P1 must run first from 0 to 5.
// At t=5, P2 (burst 3), P3 (burst 8), P4 (burst 4) have all arrived.
// Smallest burst is P2 (3), then P4 (4), then P3 (8).
const sjfResult = runSJF(sampleWorkload);
console.log("SJF Timeline:", sjfResult.timeline.map(t => `${t.pid} [${t.start}-${t.end}]`).join(" -> "));
console.log("SJF Metrics:", sjfResult.metrics);
if (
  sjfResult.timeline[0].pid === "P1" &&
  sjfResult.timeline[1].pid === "P2" &&
  sjfResult.timeline[2].pid === "P4" &&
  sjfResult.timeline[3].pid === "P3"
) {
  console.log(">>> TEST 3 PASSED: SJF does NOT pick unarrived processes (P1 -> P2 -> P4 -> P3).\n");
} else {
  console.error(">>> TEST 3 FAILED!");
  process.exit(1);
}

// TEST 4: Priority Scheduling (Lower number = Higher priority)
console.log("--- TEST 4: Priority Scheduling Selection ---");
// Sample workload:
// P1 arr 0, burst 5, prio 2
// P2 arr 1, burst 3, prio 1 (Highest priority!)
// P3 arr 2, burst 8, prio 3
// P4 arr 3, burst 4, prio 2
// At t=0, P1 starts and runs to 5.
// At t=5, among {P2 (prio 1), P3 (prio 3), P4 (prio 2)}, P2 has priority 1 (highest) -> runs 5-8.
// At t=8, between P4 (prio 2) and P3 (prio 3), P4 has higher priority -> runs 8-12.
// Finally P3 runs 12-20.
const prioResult = runPriority(sampleWorkload);
console.log("Priority Timeline:", prioResult.timeline.map(t => `${t.pid} [${t.start}-${t.end}]`).join(" -> "));
console.log("Priority Metrics:", prioResult.metrics);
if (
  prioResult.timeline[0].pid === "P1" &&
  prioResult.timeline[1].pid === "P2" &&
  prioResult.timeline[2].pid === "P4" &&
  prioResult.timeline[3].pid === "P3"
) {
  console.log(">>> TEST 4 PASSED: Priority 1 executes before Priority 2 (P1 -> P2 -> P4 -> P3).\n");
} else {
  console.error(">>> TEST 4 FAILED!");
  process.exit(1);
}

// TEST 5: Round Robin with quantum = 2
console.log("--- TEST 5: Round Robin Specific Verification ---");
const rrWorkload = [
  { id: "P1", arrivalTime: 0, burstTime: 5, priority: 1 },
  { id: "P2", arrivalTime: 0, burstTime: 3, priority: 1 },
];
// Expected slices:
// P1: [0-2], remaining: 3
// P2: [2-4], remaining: 1
// P1: [4-6], remaining: 1
// P2: [6-7], remaining: 0 (completed at 7)
// P1: [7-8], remaining: 0 (completed at 8)
const rrResult = runRoundRobin(rrWorkload, 2);
console.log("RR Timeline:", rrResult.timeline.map(t => `${t.pid} [${t.start}-${t.end}]`).join(" -> "));
console.log("RR Process Results:", rrResult.processResults);
const expectedSlices = [
  { pid: "P1", start: 0, end: 2 },
  { pid: "P2", start: 2, end: 4 },
  { pid: "P1", start: 4, end: 6 },
  { pid: "P2", start: 6, end: 7 },
  { pid: "P1", start: 7, end: 8 },
];

let rrMatches = rrResult.timeline.length === expectedSlices.length;
if (rrMatches) {
  for (let i = 0; i < expectedSlices.length; i++) {
    if (
      rrResult.timeline[i].pid !== expectedSlices[i].pid ||
      rrResult.timeline[i].start !== expectedSlices[i].start ||
      rrResult.timeline[i].end !== expectedSlices[i].end
    ) {
      rrMatches = false;
      break;
    }
  }
}

const p1 = rrResult.processResults.find(p => p.id === "P1");
const p2 = rrResult.processResults.find(p => p.id === "P2");

if (rrMatches && p1.completionTime === 8 && p2.completionTime === 7) {
  console.log(">>> TEST 5 PASSED: Round Robin matches expected slices and completions exactly.\n");
} else {
  console.error(">>> TEST 5 FAILED!", { rrResult, expectedSlices });
  process.exit(1);
}

// TEST 6: Banker's Algorithm (Safe & Unsafe)
console.log("--- TEST 6: Banker's Algorithm Verification ---");
const safeBanker = runBankerSafety(DEFAULT_BANKER_DATA.available, DEFAULT_BANKER_DATA.processes);
console.log("Safe State Check:", { isSafe: safeBanker.isSafe, sequence: safeBanker.safeSequence });

const unsafeBanker = runBankerSafety(UNSAFE_BANKER_DATA.available, UNSAFE_BANKER_DATA.processes);
console.log("Unsafe State Check:", { isSafe: unsafeBanker.isSafe, error: unsafeBanker.error });

if (safeBanker.isSafe && safeBanker.safeSequence.length === 5 && !unsafeBanker.isSafe) {
  console.log(">>> TEST 6 PASSED: Banker correctly identifies safe and unsafe states.\n");
} else {
  console.error(">>> TEST 6 FAILED!");
  process.exit(1);
}

// TEST 7: CPU Idle Time Gaps
console.log("--- TEST 7: CPU Idle Time Gaps Verification ---");
const idleWorkload = [
  { id: "P1", arrivalTime: 0, burstTime: 2, priority: 1 },
  { id: "P2", arrivalTime: 5, burstTime: 3, priority: 1 },
];
const fcfsIdle = runFCFS(idleWorkload);
if (
  fcfsIdle.timeline[1].pid === "IDLE" &&
  fcfsIdle.timeline[1].start === 2 &&
  fcfsIdle.timeline[1].end === 5 &&
  fcfsIdle.metrics.cpuUtilization === 62.5
) {
  console.log(">>> TEST 7 PASSED: IDLE gaps correctly recorded and factored into CPU utilization (62.5%).\n");
} else {
  console.error(">>> TEST 7 FAILED!");
  process.exit(1);
}

console.log("==========================================");
console.log("ALL ALGORITHM CHECKS PASSED WITH 100% SUCCESS!");
console.log("==========================================");

