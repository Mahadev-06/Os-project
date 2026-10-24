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
