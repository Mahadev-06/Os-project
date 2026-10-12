import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

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
 * Scans active browser session files for open tabs (like YouTube Music, VTOP, etc.).
 */
function getActiveBrowserTabs() {
  const localAppData = process.env.LOCALAPPDATA || "C:\\Users\\Lenovo\\AppData\\Local";
  const sessionsDir = path.join(localAppData, "BraveSoftware", "Brave-Browser", "User Data", "Default", "Sessions");
  const tempDir = os.tmpdir();
  const tabs = [];

  try {
    if (!fs.existsSync(sessionsDir)) return tabs;
    const files = fs.readdirSync(sessionsDir)
      .filter(f => f.startsWith("Session_") || f.startsWith("Tabs_"))
      .sort((a, b) => {
        const sa = fs.statSync(path.join(sessionsDir, a));
        const sb = fs.statSync(path.join(sessionsDir, b));
        return sb.mtimeMs - sa.mtimeMs;
      });

    for (const f of files.slice(0, 3)) {
      const src = path.join(sessionsDir, f);
      const dst = path.join(tempDir, `scan_tab_${f}`);
      try {
        fs.copyFileSync(src, dst);
        const buf = fs.readFileSync(dst);
        try { fs.unlinkSync(dst); } catch {}
        const text = buf.toString("utf8");

        const urls = text.match(/https?:\/\/[^\x00-\x1F\x7F"<>\s\)]+/g) || [];
        for (const u of urls) {
          if (u.includes("google.com/search?") || u.includes("brave.com") || u.includes("googlevideo.com")) continue;

          let title = "";
          let app = "Browser Tab";
          let category = "Browser Tab";

          if (u.includes("music.youtube.com")) {
            title = "YouTube Music";
            app = "YouTube Music (Web Player)";
          } else if (u.includes("youtube.com")) {
            title = "YouTube Music";
            app = "YouTube Music (Media Tab)";
          } else if (u.includes("localhost:5173")) {
            title = "OS-TaskFlow Simulator";
            app = "Active Web App";
          } else if (u.includes("leetcode.com")) {
            title = "LeetCode Algorithms";
            app = "Active Web Tab";
          } else if (u.includes("vit.ac.in")) {
            title = "VIT University Portal (VTOP)";
            app = "Active Student Portal";
          } else if (u.includes("onlinegdb.com")) {
            title = "Online GDB C/C++ Compiler";
            app = "Active Web Tab";
          } else if (u.includes("whatsapp.com")) {
            title = "WhatsApp Web";
            app = "Messaging Web App";
          }

          if (title && !tabs.some(t => t.title === title)) {
            tabs.push({ url: u, title, app, category });
          }
        }
      } catch {
        // file locked or inaccessible
      }
    }
  } catch {}

  return tabs;
}

/**
 * Runs a PowerShell script via UTF-16LE Base64 EncodedCommand
 * (completely bypasses cmd.exe quotation and argument parsing issues).
 */
function runPowershellEncoded(scriptText, timeout = 4000) {
  const buf = Buffer.from(scriptText, "utf16le");
  const base64 = buf.toString("base64");
  return execAsync(`powershell -NoProfile -NonInteractive -EncodedCommand ${base64}`, {
    timeout,
    maxBuffer: 25 * 1024 * 1024,
  });
}

/**
 * Fetches real active Windows processes and identifies open user applications vs background services.
 */
export async function getLiveProcesses() {
  const now = Date.now();
  // Cache for 2.0s for smooth responsiveness
  if (cachedProcesses && now - lastProcessFetchTime < 2000) {
    return cachedProcesses;
  }

  try {
    const psScript = `
      Get-CimInstance -ClassName Win32_Process -Property ProcessId, Name, CommandLine, WorkingSetSize, Priority | 
      Select-Object ProcessId, Name, CommandLine, WorkingSetSize, Priority | 
      ConvertTo-Json -Compress
    `;

    const { stdout } = await runPowershellEncoded(psScript, 4500);

    if (!stdout || stdout.trim() === "") {
      return getFallbackProcesses();
    }

    const rawList = JSON.parse(stdout);
    const list = Array.isArray(rawList) ? rawList : [rawList];

    // Detect open browser tabs (YouTube Music, VTOP, etc.)
    const browserTabs = getActiveBrowserTabs();

    const userApps = [];
    const backgroundProcesses = [];

    // Track added PIDs to avoid duplicate root windows
    const seenPids = new Set();

    for (const p of list) {
      const pid = p.ProcessId;
      const rawName = p.Name || "unknown.exe";
      const cmd = (p.CommandLine || "").trim();
      const lowerName = rawName.toLowerCase();
      const memMb = Math.round((Number(p.WorkingSetSize) || 0) / (1024 * 1024));
      const prio = p.Priority || 8;

      // Translate Windows base priority to simulator priority scale (1=High, 2=Normal, 3=Lower)
      let simPriority = 2;
      if (prio >= 13) simPriority = 1;
      else if (prio <= 6) simPriority = 3;

      const burstEst = Math.max(2, Math.min(10, (pid % 7) + 2));

      let isUserApp = false;
      let displayName = rawName;
      let detail = "";
      let category = "System / Background";

      // 1. BRAVE BROWSER
      if (lowerName === "brave.exe") {
        if (!cmd.includes("--type=")) {
          isUserApp = true;
          displayName = "Brave Browser";
          detail = browserTabs.length > 0
            ? `Tabs: ${browserTabs.map(t => t.title).join(", ")}`
            : "Active Web Browser Window";
          category = "User Application";
          simPriority = 1;
        }
      }
      // 2. MICROSOFT POWERPOINT
      else if (lowerName === "powerpnt.exe") {
        isUserApp = true;
        displayName = "Microsoft PowerPoint";
        const fileMatch = cmd.match(/"([^"]+\.(?:pptx?|ppsx?))"/i) || cmd.match(/([^\s]+\.(?:pptx?|ppsx?))/i);
        detail = fileMatch ? path.basename(fileMatch[1]) : "Presentation Slides";
        category = "User Application";
        simPriority = 1;
      }
      // 3. WHATSAPP
      else if (lowerName.includes("whatsapp")) {
        isUserApp = true;
        displayName = "WhatsApp Desktop";
        detail = "Instant Messaging Client";
        category = "User Application";
        simPriority = 2;
      }
      // 4. GOOGLE CHROME (detect if background daemon vs open window)
      else if (lowerName === "chrome.exe") {
        if (cmd.includes("--no-startup-window")) {
          // Chrome background process lingering without an open window
          isUserApp = false;
          displayName = "Google Chrome (Background Daemon)";
          detail = "Closed window (running in background)";
          category = "Background Service";
          simPriority = 3;
        } else if (!cmd.includes("--type=")) {
          isUserApp = true;
          displayName = "Google Chrome";
          detail = "Main Browser Window";
          category = "User Application";
          simPriority = 1;
        } else {
          isUserApp = false;
          displayName = "Google Chrome (Worker)";
          detail = "Background worker process";
          category = "Background Service";
          simPriority = 3;
        }
      }
      // 5. CHATGPT DESKTOP
      else if (lowerName.includes("chatgpt") && !cmd.includes("--type=")) {
        isUserApp = true;
        displayName = "ChatGPT Desktop";
        detail = "AI Assistant Desktop App";
        category = "User Application";
      }
      // 6. WPS OFFICE
      else if (lowerName === "wps.exe") {
        isUserApp = true;
        displayName = "WPS Office";
        detail = "Office Document Editor";
        category = "User Application";
      }
      // 7. VS CODE & IDEs
      else if (lowerName === "code.exe" && !cmd.includes("--type=")) {
        isUserApp = true;
        displayName = "Visual Studio Code";
        detail = "Source Code Editor";
        category = "User Application";
      } else if (lowerName === "antigravity.exe" && !cmd.includes("--type=")) {
        isUserApp = true;
        displayName = "Antigravity IDE";
        detail = "Active Workspace";
        category = "User Application";
      }

      if (isUserApp && !seenPids.has(pid)) {
        seenPids.add(pid);
        userApps.push({
          id: `PID-${pid}`,
          realPid: pid,
          name: displayName,
          rawName,
          windowTitle: detail,
          detail,
          category,
          isUserApp: true,
          memoryMb: memMb,
          cpuSeconds: Math.round(memMb * 0.1),
          priority: simPriority,
          burstTime: burstEst,
          arrivalTime: userApps.length % 4,
          state: "RUNNING",
        });
      } else if (memMb > 35 && !seenPids.has(pid)) {
        seenPids.add(pid);
        backgroundProcesses.push({
          id: `PID-${pid}`,
          realPid: pid,
          name: displayName,
          rawName,
          windowTitle: detail || "Background Task",
          detail: detail || "Background Task",
          category: category || "System Process",
          isUserApp: false,
          memoryMb: memMb,
          cpuSeconds: Math.round(memMb * 0.05),
          priority: simPriority,
          burstTime: burstEst,
          arrivalTime: (userApps.length + backgroundProcesses.length) % 4,
          state: "RUNNING",
        });
      }
    }

    // Also surface open tabs as distinct interactive items (e.g. YouTube Music, LeetCode, VTOP)
    const tabItems = browserTabs.map((t, idx) => ({
      id: `TAB-${8000 + idx}`,
      realPid: 8000 + idx,
      name: t.title,
      rawName: "brave.exe (Tab)",
      windowTitle: t.url,
      detail: t.app,
      category: "Browser Tab",
      isUserApp: true,
      memoryMb: 110 + (idx * 25),
      cpuSeconds: 8 + (idx * 3),
      priority: t.title.includes("YouTube") ? 1 : 2,
      burstTime: 4 + (idx % 3),
      arrivalTime: idx,
      state: "RUNNING",
    }));

    // Sort background processes by RAM descending
    backgroundProcesses.sort((a, b) => b.memoryMb - a.memoryMb);

    // Combine: User apps & open tabs FIRST, followed by top background processes
    const combined = [...userApps, ...tabItems, ...backgroundProcesses.slice(0, 35)];

    cachedProcesses = combined;
    lastProcessFetchTime = now;
    return combined;
  } catch (err) {
    console.warn("Could not query Windows processes via PowerShell CIM, using fallback:", err.message);
    return getFallbackProcesses();
  }
}

/**
 * Queries real physical disk partitions.
 */
export async function getDiskInfo() {
  try {
    const psCmd = `Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free | ConvertTo-Json -Compress`;
    const { stdout } = await runPowershellEncoded(psCmd, 3000);
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
    { id: "PID-8096", realPid: 8096, name: "Brave Browser", rawName: "brave.exe", windowTitle: "YouTube Music, OS-TaskFlow, VTOP", detail: "Active Web Browser Window", category: "User Application", isUserApp: true, memoryMb: 254, cpuSeconds: 16, priority: 1, burstTime: 5, arrivalTime: 0, state: "RUNNING" },
    { id: "TAB-8001", realPid: 8001, name: "YouTube Music", rawName: "brave.exe (Tab)", windowTitle: "https://music.youtube.com", detail: "YouTube Music (Web Player)", category: "Browser Tab", isUserApp: true, memoryMb: 140, cpuSeconds: 12, priority: 1, burstTime: 4, arrivalTime: 0, state: "RUNNING" },
    { id: "PID-21196", realPid: 21196, name: "Microsoft PowerPoint", rawName: "POWERPNT.EXE", windowTitle: "Presentation Slides", detail: "Presentation Slides", category: "User Application", isUserApp: true, memoryMb: 174, cpuSeconds: 9, priority: 1, burstTime: 4, arrivalTime: 1, state: "RUNNING" },
    { id: "PID-15076", realPid: 15076, name: "WhatsApp Desktop", rawName: "WhatsApp.Root.exe", windowTitle: "Instant Messaging Client", detail: "Instant Messaging Client", category: "User Application", isUserApp: true, memoryMb: 262, cpuSeconds: 10, priority: 2, burstTime: 3, arrivalTime: 2, state: "RUNNING" },
    { id: "PID-23260", realPid: 23260, name: "ChatGPT Desktop", rawName: "ChatGPT Classic.exe", windowTitle: "AI Assistant Desktop App", detail: "AI Assistant Desktop App", category: "User Application", isUserApp: true, memoryMb: 160, cpuSeconds: 6, priority: 2, burstTime: 4, arrivalTime: 2, state: "RUNNING" },
    { id: "PID-1048", realPid: 1048, name: "dwm.exe", rawName: "dwm.exe", windowTitle: "Desktop Window Manager", detail: "Desktop Window Manager", category: "System Process", isUserApp: false, memoryMb: 209, cpuSeconds: 8, priority: 2, burstTime: 4, arrivalTime: 3, state: "RUNNING" },
    { id: "PID-1704", realPid: 1704, name: "svchost.exe", rawName: "svchost.exe", windowTitle: "Windows Host Process", detail: "Windows Host Process", category: "System Process", isUserApp: false, memoryMb: 45, cpuSeconds: 2, priority: 3, burstTime: 2, arrivalTime: 3, state: "RUNNING" },
  ];
}
