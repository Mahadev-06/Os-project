import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const psScriptPath = path.join(__dirname, "getDesktopWindows.ps1");

// Cache for CPU load calculation and processes
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
  let totalLoad = 12;

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
 * Fetches real active Windows desktop windows and genuine host processes.
 * Only processes with a real visible window on the user's desktop are classified as open user apps.
 */
export async function getLiveProcesses() {
  const now = Date.now();
  // 1.0s cache: instantly reflects newly opened or closed applications
  if (cachedProcesses && now - lastProcessFetchTime < 1000) {
    return cachedProcesses;
  }

  try {
    const psCmd = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${psScriptPath}"`;
    const { stdout } = await execAsync(psCmd, { timeout: 6000, maxBuffer: 15 * 1024 * 1024 });

    // Strip out any CLI progress XML if present
    const jsonStart = stdout.indexOf("{");
    const jsonEnd = stdout.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return getFallbackProcesses();
    }

    const payload = JSON.parse(stdout.slice(jsonStart, jsonEnd + 1));
    const rawOpenApps = Array.isArray(payload.OpenApps) ? payload.OpenApps : (payload.OpenApps ? [payload.OpenApps] : []);
    const rawBgProcs = Array.isArray(payload.Background) ? payload.Background : (payload.Background ? [payload.Background] : []);

    const userApps = [];
    const seenPids = new Set();
    const seenTitles = new Set();

    for (const item of rawOpenApps) {
      const pid = item.Pid;
      const rawProc = (item.ProcessName || "").toLowerCase();
      const title = (item.Title || "").trim();

      // Deduplicate helper sub-processes (e.g. msedgewebview2 inside WhatsApp)
      if (rawProc === "msedgewebview2" && seenTitles.has("WhatsApp")) continue;
      if (rawProc === "applicationframehost" && seenTitles.has("Settings")) continue;
      if (seenPids.has(pid)) continue;

      let displayName = item.ProcessName;
      let category = "User Application";
      let detail = title;

      // 1. YouTube Music (Chrome PWA or browser window)
      if (title.includes("YouTube Music") || rawProc.includes("music")) {
        displayName = "YouTube Music";
        category = "Media / Audio Player";
        detail = title.replace(" - YouTube Music", "").replace("YouTube Music - ", "").trim();
      }
      // 2. Microsoft PowerPoint
      else if (rawProc === "powerpnt" || title.includes("PowerPoint")) {
        displayName = "Microsoft PowerPoint";
        category = "Presentation / Office";
        detail = title.replace(" - PowerPoint", "").replace(" - Protected View", "").trim();
      }
      // 3. WhatsApp Desktop
      else if (rawProc.includes("whatsapp") || title === "WhatsApp") {
        displayName = "WhatsApp Desktop";
        category = "Messaging Client";
        detail = "Active WhatsApp Window";
      }
      // 4. Brave Browser
      else if (rawProc === "brave") {
        displayName = "Brave Browser";
        category = "Web Browser";
        detail = title.replace(" - Brave", "").trim();
      }
      // 5. Google Chrome
      else if (rawProc === "chrome") {
        displayName = "Google Chrome";
        category = "Web Browser";
        detail = title.replace(" - Google Chrome", "").trim();
      }
      // 6. ChatGPT Desktop
      else if (rawProc.includes("chatgpt") || title.includes("ChatGPT")) {
        displayName = "ChatGPT Desktop";
        category = "AI Assistant";
        detail = "Active ChatGPT Window";
      }
      // 7. Code Editors / IDEs
      else if (rawProc.includes("antigravity")) {
        displayName = "Antigravity IDE";
        category = "Code Editor";
        detail = title;
      } else if (rawProc === "code" || title.includes("Visual Studio Code")) {
        displayName = "Visual Studio Code";
        category = "Code Editor";
        detail = title.replace(" - Visual Studio Code", "").trim();
      }
      // 8. Text Editors & Utilities
      else if (rawProc === "notepad") {
        displayName = "Notepad";
        category = "Text Editor";
        detail = title.replace(" - Notepad", "").trim();
      } else if (rawProc.includes("calc") || title.includes("Calculator")) {
        displayName = "Calculator";
        category = "Utility App";
        detail = "Windows Calculator";
      } else if (rawProc.includes("spotify") || title.includes("Spotify")) {
        displayName = "Spotify";
        category = "Media / Audio Player";
        detail = title.replace(" - Spotify", "").trim();
      } else if (rawProc === "systemsettings") {
        displayName = "Windows Settings";
        category = "System Settings";
        detail = "Settings & Configuration";
      } else {
        // Any newly opened user application on the desktop!
        displayName = item.ProcessName.charAt(0).toUpperCase() + item.ProcessName.slice(1);
        category = "User Application";
        detail = title;
      }

      seenPids.add(pid);
      seenTitles.add(title);
      seenTitles.add(displayName);

      const memMb = item.WorkingSetMb || 0;
      const rawCpu = item.CpuSeconds || 0;
      const prio = item.Priority || 8;
      const simPriority = prio >= 13 ? 1 : prio <= 6 ? 3 : 2;
      const burstEst = Math.max(2, Math.min(10, (pid % 7) + 2));

      userApps.push({
        id: `PID-${pid}`,
        realPid: pid,
        name: displayName,
        rawName: `${item.ProcessName}.exe`,
        windowTitle: detail,
        detail,
        category,
        isUserApp: true,
        memoryMb: memMb,
        cpuSeconds: rawCpu,
        priority: simPriority,
        rawPriority: prio,
        burstTime: burstEst,
        arrivalTime: userApps.length % 4,
        state: item.Responding ? "RUNNING" : "WAITING",
      });
    }

    // Background processes
    const backgroundProcesses = [];
    for (const bg of rawBgProcs) {
      const pid = bg.Pid;
      if (seenPids.has(pid)) continue;
      seenPids.add(pid);

      const rawProc = (bg.ProcessName || "").toLowerCase();
      let displayName = `${bg.ProcessName}.exe`;
      let category = "System / Background";
      let detail = "Background OS Process";

      if (rawProc === "chrome") {
        displayName = "Google Chrome (Background Task)";
        category = "Background Service";
        detail = "No open window (--no-startup-window)";
      } else if (rawProc === "wps") {
        displayName = "WPS Office (Background Service)";
        category = "Background Service";
        detail = "Quickstart / Cloud Service (No Open Window)";
      } else if (rawProc === "svchost") {
        displayName = "Host Process for Windows Services";
        category = "System Process";
      } else if (rawProc === "dwm") {
        displayName = "Desktop Window Manager";
        category = "System Process";
      }

      const memMb = bg.WorkingSetMb || 0;
      const prio = bg.Priority || 8;
      const simPriority = prio >= 13 ? 1 : prio <= 6 ? 3 : 2;
      const burstEst = Math.max(2, Math.min(10, (pid % 7) + 2));

      backgroundProcesses.push({
        id: `PID-${pid}`,
        realPid: pid,
        name: displayName,
        rawName: `${bg.ProcessName}.exe`,
        windowTitle: detail,
        detail,
        category,
        isUserApp: false,
        memoryMb: memMb,
        cpuSeconds: bg.CpuSeconds || 0,
        priority: simPriority,
        rawPriority: prio,
        burstTime: burstEst,
        arrivalTime: (userApps.length + backgroundProcesses.length) % 4,
        state: bg.Responding ? "RUNNING" : "WAITING",
      });
    }

    // Combine: Live open apps FIRST, followed by top background processes
    const combined = [...userApps, ...backgroundProcesses];

    cachedProcesses = combined;
    lastProcessFetchTime = now;
    return combined;
  } catch (err) {
    console.warn("Could not query Windows desktop windows, using fallback:", err.message);
    return getFallbackProcesses();
  }
}

/**
 * Queries real physical disk partitions.
 */
export async function getDiskInfo() {
  try {
    const psCmd = `powershell -NoProfile -Command "Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free | ConvertTo-Json -Compress"`;
    const { stdout } = await execAsync(psCmd, { timeout: 3000 });
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
    { id: "PID-17244", realPid: 17244, name: "YouTube Music", rawName: "chrome.exe", windowTitle: "Ishq (From 'Lost;Found') | YouTube Music", detail: "Media / Audio Player", category: "Media / Audio Player", isUserApp: true, memoryMb: 226, cpuSeconds: 216, priority: 1, burstTime: 5, arrivalTime: 0, state: "RUNNING" },
    { id: "PID-8096", realPid: 8096, name: "Brave Browser", rawName: "brave.exe", windowTitle: "OS-TaskFlow Simulator", detail: "Active Web Browser Window", category: "Web Browser", isUserApp: true, memoryMb: 239, cpuSeconds: 154, priority: 1, burstTime: 4, arrivalTime: 1, state: "RUNNING" },
    { id: "PID-21196", realPid: 21196, name: "Microsoft PowerPoint", rawName: "POWERPNT.exe", windowTitle: "Campus_Communication_Network_Analyzer_Reordered (2).pptx", detail: "Presentation / Office", category: "Presentation / Office", isUserApp: true, memoryMb: 173, cpuSeconds: 34, priority: 1, burstTime: 4, arrivalTime: 2, state: "RUNNING" },
    { id: "PID-15076", realPid: 15076, name: "WhatsApp Desktop", rawName: "WhatsApp.Root.exe", windowTitle: "Active WhatsApp Window", detail: "Messaging Client", category: "Messaging Client", isUserApp: true, memoryMb: 257, cpuSeconds: 179, priority: 2, burstTime: 3, arrivalTime: 3, state: "RUNNING" },
    { id: "PID-23260", realPid: 23260, name: "ChatGPT Desktop", rawName: "ChatGPT Classic.exe", windowTitle: "Active ChatGPT Window", detail: "AI Assistant", category: "AI Assistant", isUserApp: true, memoryMb: 151, cpuSeconds: 151, priority: 2, burstTime: 4, arrivalTime: 0, state: "RUNNING" },
    { id: "PID-1048", realPid: 1048, name: "Desktop Window Manager", rawName: "dwm.exe", windowTitle: "Desktop Window Manager", detail: "System Process", category: "System Process", isUserApp: false, memoryMb: 209, cpuSeconds: 8, priority: 2, burstTime: 4, arrivalTime: 1, state: "RUNNING" },
    { id: "PID-1704", realPid: 1704, name: "Host Process for Windows Services", rawName: "svchost.exe", windowTitle: "Windows Host Process", detail: "System Process", category: "System Process", isUserApp: false, memoryMb: 45, cpuSeconds: 2, priority: 3, burstTime: 2, arrivalTime: 2, state: "RUNNING" },
  ];
}
