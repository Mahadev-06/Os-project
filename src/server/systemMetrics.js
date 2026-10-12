import os from "node:os";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Cache for CPU load calculation
let lastCpuMeasure = null;
let cachedProcesses = null;
let lastProcessFetchTime = 0;

/**
 * Returns static and semi-static host hardware overview.
 */
export function getSystemOverview() {
  const cpus = os.cpus() || [];
  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();
  const usedMemBytes = totalMemBytes - freeMemBytes;

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    uptime: Math.floor(os.uptime()),
    cpuModel: cpus[0]?.model || "x86_64 Processor",
    cpuCores: cpus.length,
    cpuSpeedMhz: cpus[0]?.speed || 0,
    totalMemoryGb: Number((totalMemBytes / (1024 ** 3)).toFixed(2)),
    freeMemoryGb: Number((freeMemBytes / (1024 ** 3)).toFixed(2)),
    usedMemoryGb: Number((usedMemBytes / (1024 ** 3)).toFixed(2)),
    memoryUtilization: Math.round((usedMemBytes / totalMemBytes) * 100),
  };
}

/**
 * Calculates current CPU load and memory usage.
 */
export function getLiveMetrics() {
  const cpus = os.cpus() || [];
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;

  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }

  const total = user + nice + sys + idle + irq;
  let totalLoad = 10;

  if (lastCpuMeasure) {
    const diffTotal = total - lastCpuMeasure.total;
    const diffIdle = idle - lastCpuMeasure.idle;
    if (diffTotal > 0) {
      totalLoad = Math.min(100, Math.max(0, Math.round(((diffTotal - diffIdle) / diffTotal) * 100)));
    }
  }

  lastCpuMeasure = { total, idle, time: Date.now() };

  // Per-core utilization estimation
  const perCore = cpus.map((cpu, idx) => {
    const coreTotal = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    const busy = coreTotal - cpu.times.idle;
    const pct = coreTotal > 0 ? Math.round((busy / coreTotal) * 100) : totalLoad;
    return {
      core: idx,
      load: Math.min(100, Math.max(5, pct)),
    };
  });

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    timestamp: Date.now(),
    cpuLoad: totalLoad,
    cpuPerCore: perCore,
    memory: {
      totalGb: Number((totalMem / (1024 ** 3)).toFixed(2)),
      usedGb: Number((usedMem / (1024 ** 3)).toFixed(2)),
      freeGb: Number((freeMem / (1024 ** 3)).toFixed(2)),
      percent: Math.round((usedMem / totalMem) * 100),
    },
    uptime: Math.floor(os.uptime()),
  };
}

/**
 * Fetches real active Windows processes using native PowerShell.
 * Returns the top active processes sorted by memory / CPU.
 */
export async function getLiveProcesses() {
  const now = Date.now();
  // Cache for 1.5s to keep performance snappy and prevent sub-process spam
  if (cachedProcesses && now - lastProcessFetchTime < 1500) {
    return cachedProcesses;
  }

  try {
    const psCmd = `powershell -NoProfile -Command "Get-Process | Where-Object { $_.WorkingSet64 -gt 15MB } | Sort-Object WorkingSet64 -Descending | Select-Object -First 30 -Property Id, ProcessName, CPU, WorkingSet64, BasePriority, Responding, Handles | ConvertTo-Json -Compress"`;
    const { stdout } = await execAsync(psCmd, { timeout: 3500 });
    
    if (!stdout || stdout.trim() === "") {
      return getFallbackProcesses();
    }

    const parsed = JSON.parse(stdout);
    const list = Array.isArray(parsed) ? parsed : [parsed];

    const mapped = list.map((p, idx) => {
      const memoryMb = Math.round((p.WorkingSet64 || 0) / (1024 * 1024));
      const rawCpu = typeof p.CPU === "number" ? Math.round(p.CPU) : 0;
      const prio = p.BasePriority || 8;

      // Translate Windows base priority (4=Idle, 8=Normal, 13=High, 24=RealTime)
      // to our simulator priority scale (1=Highest, 2=Normal, 3=Lower)
      let simPriority = 2;
      if (prio >= 13) simPriority = 1;
      else if (prio <= 6) simPriority = 3;

      // Map CPU time into an estimated burst units for scheduling lab (e.g. 1 - 10)
      const burstEst = Math.max(2, Math.min(10, Math.round((rawCpu % 8) + 2)));

      return {
        id: `PID-${p.Id}`,
        realPid: p.Id,
        name: p.ProcessName,
        memoryMb,
        cpuSeconds: rawCpu,
        rawPriority: prio,
        priority: simPriority,
        burstTime: burstEst,
        arrivalTime: idx % 4, // staggered for scheduling lab
        state: p.Responding !== false ? "RUNNING" : "WAITING",
        handles: p.Handles || 0,
      };
    });

    cachedProcesses = mapped;
    lastProcessFetchTime = now;
    return mapped;
  } catch (err) {
    console.warn("Could not query Windows processes via PowerShell, using fallback:", err.message);
    return getFallbackProcesses();
  }
}

/**
 * Queries real physical disk partitions.
 */
export async function getDiskInfo() {
  try {
    const psCmd = `powershell -NoProfile -Command "Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free | ConvertTo-Json -Compress"`;
    const { stdout } = await execAsync(psCmd, { timeout: 2500 });
    const parsed = JSON.parse(stdout);
    const list = Array.isArray(parsed) ? parsed : [parsed];

    return list.map((d) => {
      const usedGb = d.Used ? Math.round(d.Used / (1024 ** 3)) : 0;
      const freeGb = d.Free ? Math.round(d.Free / (1024 ** 3)) : 0;
      const totalGb = usedGb + freeGb;
      return {
        drive: `${d.Name}:`,
        usedGb,
        freeGb,
        totalGb,
        percent: totalGb > 0 ? Math.round((usedGb / totalGb) * 100) : 0,
      };
    });
  } catch {
    return [
      { drive: "C:", usedGb: 140, freeGb: 116, totalGb: 256, percent: 55 },
    ];
  }
}

function getFallbackProcesses() {
  return [
    { id: "PID-1042", realPid: 1042, name: "chrome.exe", memoryMb: 420, cpuSeconds: 14, priority: 2, burstTime: 5, arrivalTime: 0, state: "RUNNING" },
    { id: "PID-3204", realPid: 3204, name: "code.exe", memoryMb: 310, cpuSeconds: 8, priority: 1, burstTime: 4, arrivalTime: 1, state: "RUNNING" },
    { id: "PID-512", realPid: 512, name: "explorer.exe", memoryMb: 195, cpuSeconds: 5, priority: 2, burstTime: 3, arrivalTime: 2, state: "READY" },
    { id: "PID-892", realPid: 892, name: "svchost.exe", memoryMb: 85, cpuSeconds: 2, priority: 3, burstTime: 2, arrivalTime: 3, state: "WAITING" },
  ];
}
