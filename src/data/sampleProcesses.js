export const INITIAL_SAMPLE_PROCESSES = [
  {
    id: "P1",
    arrivalTime: 0,
    burstTime: 5,
    priority: 2,
    memory: 128,
    state: "READY",
  },
  {
    id: "P2",
    arrivalTime: 1,
    burstTime: 3,
    priority: 1,
    memory: 64,
    state: "READY",
  },
  {
    id: "P3",
    arrivalTime: 2,
    burstTime: 8,
    priority: 3,
    memory: 256,
    state: "READY",
  },
  {
    id: "P4",
    arrivalTime: 3,
    burstTime: 4,
    priority: 2,
    memory: 128,
    state: "READY",
  },
];

export const VALID_PROCESS_STATES = [
  "NEW",
  "READY",
  "RUNNING",
  "WAITING",
  "TERMINATED",
];

// Valid state transitions mapped according to standard OS lifecycle:
// NEW -> READY
// READY -> RUNNING
// RUNNING -> WAITING
// WAITING -> READY
// RUNNING -> TERMINATED
export const ALLOWED_STATE_TRANSITIONS = {
  NEW: ["READY"],
  READY: ["RUNNING"],
  RUNNING: ["WAITING", "TERMINATED"],
  WAITING: ["READY"],
  TERMINATED: [],
};
