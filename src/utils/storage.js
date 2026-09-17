import { INITIAL_SAMPLE_PROCESSES } from "../data/sampleProcesses";
import { DEFAULT_BANKER_DATA } from "../data/sampleBankerData";

const STORAGE_KEYS = {
  PROCESSES: "os_taskflow_processes",
  QUANTUM: "os_taskflow_quantum",
  SELECTED_ALGO: "os_taskflow_algorithm",
  RESOURCES: "os_taskflow_resources",
  BANKER: "os_taskflow_banker",
  EVENTS: "os_taskflow_events",
};

// Safe JSON parser with fallback
export function safeGetStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading from localStorage key "${key}":`, err);
    return fallback;
  }
}

export function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to localStorage key "${key}":`, err);
  }
}

export function getStoredProcesses() {
  const processes = safeGetStorage(STORAGE_KEYS.PROCESSES, null);
  if (!processes || !Array.isArray(processes) || processes.length === 0) {
    // If not set or invalid, initialize with initial sample processes
    safeSetStorage(STORAGE_KEYS.PROCESSES, INITIAL_SAMPLE_PROCESSES);
    return INITIAL_SAMPLE_PROCESSES;
  }
  return processes;
}

export function setStoredProcesses(processes) {
  safeSetStorage(STORAGE_KEYS.PROCESSES, processes);
}

export function getStoredQuantum() {
  const q = safeGetStorage(STORAGE_KEYS.QUANTUM, 2);
  const parsed = Number(q);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 2;
}

export function setStoredQuantum(quantum) {
  safeSetStorage(STORAGE_KEYS.QUANTUM, quantum);
}

export function getStoredAlgorithm() {
  return safeGetStorage(STORAGE_KEYS.SELECTED_ALGO, "FCFS");
}

export function setStoredAlgorithm(algo) {
  safeSetStorage(STORAGE_KEYS.SELECTED_ALGO, algo);
}

export const DEFAULT_RESOURCES = {
  available: {
    Printer: 1,
    Scanner: 1,
    Disk: 2,
    Network: 2,
  },
  allocations: {
    // processId: { Printer: 0, Scanner: 0, Disk: 0, Network: 0 }
  },
};

export function getStoredResources() {
  const res = safeGetStorage(STORAGE_KEYS.RESOURCES, null);
  if (!res || !res.available || !res.allocations) {
    safeSetStorage(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES);
    return DEFAULT_RESOURCES;
  }
  return res;
}

export function setStoredResources(res) {
  safeSetStorage(STORAGE_KEYS.RESOURCES, res);
}

export function getStoredBankerData() {
  const data = safeGetStorage(STORAGE_KEYS.BANKER, null);
  if (!data || !data.available || !data.processes) {
    safeSetStorage(STORAGE_KEYS.BANKER, DEFAULT_BANKER_DATA);
    return DEFAULT_BANKER_DATA;
  }
  return data;
}

export function setStoredBankerData(data) {
  safeSetStorage(STORAGE_KEYS.BANKER, data);
}

export function getStoredEvents() {
  const events = safeGetStorage(STORAGE_KEYS.EVENTS, null);
  if (!events || !Array.isArray(events)) {
    const initialEvents = [
      { id: "evt-1", timestamp: new Date().toLocaleTimeString(), message: "System initialized with sample processes P1, P2, P3, P4" },
      { id: "evt-2", timestamp: new Date().toLocaleTimeString(), message: "Ready Queue populated with 4 processes" },
    ];
    safeSetStorage(STORAGE_KEYS.EVENTS, initialEvents);
    return initialEvents;
  }
  return events;
}

export function addStoredEvent(message) {
  const events = getStoredEvents();
  const newEvent = {
    id: "evt-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toLocaleTimeString(),
    message,
  };
  const updated = [newEvent, ...events].slice(0, 20); // keep recent 20
  safeSetStorage(STORAGE_KEYS.EVENTS, updated);
  return updated;
}
