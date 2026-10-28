/**
 * Sample Workload Presets for Banker's Algorithm & Security Threat Detection
 */

export const DEFAULT_BANKER_DATA = {
  resourceNames: ["A", "B", "C"],
  available: [3, 3, 2],
  processes: [
    { id: "P0", name: "Kernel I/O Scheduler", priority: 2, allocation: [0, 1, 0], max: [7, 5, 3] },
    { id: "P1", name: "High-Priority Realtime Worker", priority: 1, allocation: [2, 0, 0], max: [3, 2, 2] },
    { id: "P2", name: "Compute Thread Pool", priority: 2, allocation: [3, 0, 2], max: [9, 0, 2] },
    { id: "P3", name: "Database Cache Manager", priority: 2, allocation: [2, 1, 1], max: [2, 2, 2] },
    { id: "P4", name: "Background Telemetry Service", priority: 3, allocation: [0, 0, 2], max: [4, 3, 3] },
  ],
};

// Attack Scenario 1: Priority Inversion & Rogue Background Monopolization
// A process with least priority (Priority 4 / Idle) monopolizes critical resource locks,
// starving high-priority processes (Priority 1) and freezing the system.
export const PRIORITY_INVERSION_ATTACK_DATA = {
  resourceNames: ["A", "B", "C"],
  available: [1, 0, 0],
  processes: [
    { id: "P0", name: "High-Priority Realtime Audio", priority: 1, allocation: [1, 0, 0], max: [3, 2, 2] },
    { id: "P1", name: "Critical Display Window Manager", priority: 1, allocation: [1, 1, 0], max: [2, 2, 2] },
    { id: "P2_ROGUE", name: "Rogue Stealth Miner (Backdoor)", priority: 4, allocation: [3, 2, 2], max: [4, 4, 3] },
    { id: "P3", name: "Filesystem Journal Worker", priority: 2, allocation: [0, 0, 1], max: [1, 1, 2] },
  ],
};

// Attack Scenario 2: Circular Wait Denial-of-Service Attack (Total Deadlock)
// Depletes all available resources to [0,0,0] where all processes hold resources needed by others.
export const UNSAFE_BANKER_DATA = {
  resourceNames: ["A", "B", "C"],
  available: [0, 0, 0],
  processes: [
    { id: "P0", name: "Network Socket Controller", priority: 2, allocation: [1, 2, 1], max: [3, 4, 3] },
    { id: "P1", name: "Graphics Memory Driver", priority: 2, allocation: [2, 0, 1], max: [4, 2, 2] },
    { id: "P2", name: "Suspicious Background Task", priority: 3, allocation: [2, 2, 1], max: [5, 3, 3] },
  ],
};

export const CIRCULAR_WAIT_ATTACK_DATA = UNSAFE_BANKER_DATA;

// Mock Security Threat Profiles for the Interactive Threat Generator & Alert Modal
export const MOCK_SECURITY_THREAT_PROFILES = [
  {
    id: "priority_inversion_miner",
    name: "Rogue Background Miner (Priority Inversion Attack)",
    shortLabel: "Priority Inversion Miner",
    severity: "CRITICAL",
    threatLevel: 4,
    threatVector: "Priority Inversion & Rogue Resource Monopolization",
    processId: "PID-8842",
    processName: "stealth_crypto_miner.exe",
    priorityTier: "Priority 4 (Least / Idle Priority)",
    contestedLocks: "A: 3, B: 2, C: 2 (Holding 85% of physical hardware mutexes)",
    starvedProcesses: "P0 (Audio Realtime Engine - Priority 1), P1 (Window Manager - Priority 1)",
    description:
      "A rogue background thread with the lowest OS base priority (Priority 4/Idle) has seized critical mutex locks on shared resources while refusing to yield. Critical real-time tasks with Priority 1 are completely starved in a circular wait, dropping system throughput to 0%.",
    mitigationPlan: [
      "Identify offending rogue process PID-8842 (stealth_crypto_miner.exe)",
      "Force-preempt held hardware mutexes [A: 3, B: 2, C: 2]",
      "Terminate rogue worker and return allocations to kernel Available vector",
      "Re-evaluate Dijkstra's safety invariant to restore valid execution sequence",
    ],
    data: PRIORITY_INVERSION_ATTACK_DATA,
  },
  {
    id: "circular_deadlock_dos",
    name: "Circular Wait Denial-of-Service Attack",
    shortLabel: "Circular Wait DoS Attack",
    severity: "CRITICAL",
    threatLevel: 4,
    threatVector: "Mutual Exclusion & Cyclic Dependency Lockout",
    processId: "PID-7719",
    processName: "cyclic_lock_hijack.sys",
    priorityTier: "Priority 3 (Low Priority)",
    contestedLocks: "A: 2, B: 2, C: 1 (Depleted system Available capacity to [0, 0, 0])",
    starvedProcesses: "All concurrent worker threads (P0, P1, P2)",
    description:
      "Adversarial process cycle has exhausted all available resource units [0, 0, 0]. Each process holds resources needed by another, causing a classical unrecoverable Circular Hold-and-Wait condition. CPU utilization has spiked with zero forward progress.",
    mitigationPlan: [
      "Break circular dependency chain via automated kernel preemption",
      "Reclaim contested device allocations back into system pool",
      "Roll back allocations to verified Safe State checkpoint",
      "Restore multi-process execution without thread starvation",
    ],
    data: UNSAFE_BANKER_DATA,
  },
];
