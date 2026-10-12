/**
 * Client-side utility to communicate with the local host system metrics bridge.
 */

export async function fetchSystemOverview() {
  try {
    const res = await fetch("/api/system/overview");
    if (!res.ok) throw new Error("Status " + res.status);
    return { data: await res.json(), isLive: true };
  } catch (err) {
    return {
      data: {
        hostname: "HOST-PC",
        platform: "win32",
        release: "Windows 11 Pro",
        arch: "x64",
        uptime: 14200,
        cpuModel: "Intel(R) Core(TM) Processor",
        cpuCores: 8,
        totalMemoryGb: 16.0,
        freeMemoryGb: 6.8,
        usedMemoryGb: 9.2,
        memoryUtilization: 58,
      },
      isLive: false,
    };
  }
}

export async function fetchLiveMetrics() {
  try {
    const res = await fetch("/api/system/metrics");
    if (!res.ok) throw new Error("Status " + res.status);
    return { data: await res.json(), isLive: true };
  } catch (err) {
    return {
      data: {
        timestamp: Date.now(),
        cpuLoad: 28,
        cpuPerCore: Array.from({ length: 8 }, (_, idx) => ({
          core: idx,
          load: 20 + Math.floor(Math.random() * 25),
        })),
        memory: {
          totalGb: 16.0,
          usedGb: 9.2,
          freeGb: 6.8,
          percent: 58,
        },
        uptime: 14200,
      },
      isLive: false,
    };
  }
}

export async function fetchLiveProcesses() {
  try {
    const res = await fetch("/api/system/processes");
    if (!res.ok) throw new Error("Status " + res.status);
    return { data: await res.json(), isLive: true };
  } catch (err) {
    return {
      data: [
        { id: "PID-1042", realPid: 1042, name: "chrome.exe", memoryMb: 480, cpuSeconds: 15, priority: 2, burstTime: 5, arrivalTime: 0, state: "RUNNING" },
        { id: "PID-3204", realPid: 3204, name: "code.exe", memoryMb: 340, cpuSeconds: 9, priority: 1, burstTime: 4, arrivalTime: 1, state: "RUNNING" },
        { id: "PID-512", realPid: 512, name: "explorer.exe", memoryMb: 210, cpuSeconds: 4, priority: 2, burstTime: 3, arrivalTime: 2, state: "READY" },
        { id: "PID-892", realPid: 892, name: "svchost.exe", memoryMb: 95, cpuSeconds: 2, priority: 3, burstTime: 2, arrivalTime: 3, state: "WAITING" },
      ],
      isLive: false,
    };
  }
}

export async function fetchDisks() {
  try {
    const res = await fetch("/api/system/disks");
    if (!res.ok) throw new Error("Status " + res.status);
    return { data: await res.json(), isLive: true };
  } catch {
    return {
      data: [{ drive: "C:", usedGb: 140, freeGb: 116, totalGb: 256, percent: 55 }],
      isLive: false,
    };
  }
}
