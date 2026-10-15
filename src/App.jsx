import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import ProcessManager from "./pages/ProcessManager";
import CpuScheduler from "./pages/CpuScheduler";
import AlgorithmComparison from "./pages/AlgorithmComparison";
import ResourceManager from "./pages/ResourceManager";
import DeadlockAnalyzer from "./pages/DeadlockAnalyzer";
import About from "./pages/About";

import { INITIAL_SAMPLE_PROCESSES, ALLOWED_STATE_TRANSITIONS } from "./data/sampleProcesses";
import {
  getStoredProcesses,
  setStoredProcesses,
  getStoredQuantum,
  setStoredQuantum,
  getStoredAlgorithm,
  setStoredAlgorithm,
  getStoredResources,
  setStoredResources,
  getStoredBankerData,
  setStoredBankerData,
  getStoredEvents,
  addStoredEvent,
  DEFAULT_RESOURCES,
} from "./utils/storage";

import {
  fetchSystemOverview,
  fetchLiveMetrics,
  fetchLiveProcesses,
  fetchDisks,
} from "./utils/systemApi";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [mode, setMode] = useState("live"); // "live" (Real PC) | "simulation" (Sample P1-P4)
  const [processes, setProcesses] = useState(getStoredProcesses);
  const [quantum, setQuantum] = useState(getStoredQuantum);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(getStoredAlgorithm);
  const [resources, setResources] = useState(getStoredResources);
  const [bankerData, setBankerData] = useState(getStoredBankerData);
  const [events, setEvents] = useState(getStoredEvents);
  const [latestMetrics, setLatestMetrics] = useState(null);

  // Real PC Hardware State
  const [systemOverview, setSystemOverview] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [liveProcesses, setLiveProcesses] = useState([]);
  const [disks, setDisks] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHostConnected, setIsHostConnected] = useState(true);

  // Sync state to localStorage whenever processes change
  useEffect(() => {
    setStoredProcesses(processes);
  }, [processes]);

  useEffect(() => {
    setStoredQuantum(quantum);
  }, [quantum]);

  useEffect(() => {
    setStoredAlgorithm(selectedAlgorithm);
  }, [selectedAlgorithm]);

  useEffect(() => {
    setStoredResources(resources);
  }, [resources]);

  useEffect(() => {
    setStoredBankerData(bankerData);
  }, [bankerData]);

  const logEvent = useCallback((message) => {
    const updated = addStoredEvent(message);
    setEvents(updated);
  }, []);

  // Fetch initial host hardware specs
  const refreshSystemData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [ov, lm, lp, dk] = await Promise.all([
        fetchSystemOverview(),
        fetchLiveMetrics(),
        fetchLiveProcesses(),
        fetchDisks(),
      ]);
      setIsHostConnected(Boolean(ov?.isLive && lp?.isLive));
      setSystemOverview(ov.data);
      setLiveMetrics(lm.data);
      setLiveProcesses(lp.data);
      setDisks(dk.data);
    } catch (err) {
      setIsHostConnected(false);
      console.warn("Failed fetching live system metrics:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and polling
  useEffect(() => {
    refreshSystemData();

    // High frequency metrics poll (every 2.5s)
    const metricsTimer = setInterval(async () => {
      const lm = await fetchLiveMetrics();
      setLiveMetrics(lm.data);
    }, 2500);

    // Process list poll (every 2s for instant response when opening/closing apps)
    const procTimer = setInterval(async () => {
      const lp = await fetchLiveProcesses();
      setLiveProcesses(lp.data);
    }, 2000);

    return () => {
      clearInterval(metricsTimer);
      clearInterval(procTimer);
    };
  }, [refreshSystemData]);

  // Import Live Windows Tasks into Scheduler Workload
  const handleImportLiveProcesses = (selectedList) => {
    const tasks = selectedList && selectedList.length > 0 ? selectedList : liveProcesses.slice(0, 4);
    if (!tasks || tasks.length === 0) return;

    const imported = tasks.map((lp, idx) => ({
      id: `P-${lp.name.replace(".exe", "").substring(0, 8)}`,
      realPid: lp.realPid,
      name: lp.name,
      arrivalTime: idx % 3,
      burstTime: lp.burstTime || 4,
      priority: lp.priority || 2,
      memory: lp.memoryMb || 128,
      state: "READY",
    }));

    setProcesses(imported);
    logEvent(`Imported ${imported.length} active Windows tasks into scheduler`);
  };

  // Add Process
  const handleAddProcess = (newProcess) => {
    const updated = [...processes, newProcess];
    setProcesses(updated);
    logEvent(`Process ${newProcess.id} created (Arrival: ${newProcess.arrivalTime}, Burst: ${newProcess.burstTime})`);
  };

  // Update Process
  const handleUpdateProcess = (updatedProcess) => {
    const updated = processes.map((p) => (p.id === updatedProcess.id ? updatedProcess : p));
    setProcesses(updated);
    logEvent(`Process ${updatedProcess.id} configuration updated`);
  };

  // Delete Process
  const handleDeleteProcess = (pid) => {
    const updated = processes.filter((p) => p.id !== pid);
    setProcesses(updated);

    const updatedAllocations = { ...resources.allocations };
    if (updatedAllocations[pid]) {
      const held = updatedAllocations[pid];
      const updatedAvailable = { ...resources.available };
      Object.keys(held).forEach((res) => {
        updatedAvailable[res] = (updatedAvailable[res] || 0) + (held[res] || 0);
      });
      delete updatedAllocations[pid];
      setResources({ available: updatedAvailable, allocations: updatedAllocations });
    }

    logEvent(`Process ${pid} deleted from system`);
  };

  // State Transitions
  const handleStateChange = (pid, targetState) => {
    const p = processes.find((item) => item.id === pid);
    if (!p) return;

    const currentState = p.state || "NEW";
    const allowed = ALLOWED_STATE_TRANSITIONS[currentState] || [];
    if (!allowed.includes(targetState)) {
      alert(`Invalid transition from ${currentState} to ${targetState} according to OS process lifecycle rules.`);
      return;
    }

    let updated = processes.map((item) => {
      if (item.id === pid) {
        return { ...item, state: targetState };
      }
      if (targetState === "RUNNING" && item.state === "RUNNING") {
        return { ...item, state: "READY" };
      }
      return item;
    });

    setProcesses(updated);
    logEvent(`Process ${pid} transitioned: ${currentState} → ${targetState}`);
  };

  // Reset all processes
  const handleResetAll = () => {
    setProcesses([]);
    setResources(DEFAULT_RESOURCES);
    logEvent("All processes wiped from memory");
  };

  // Restore defaults (P1-P4)
  const handleRestoreDefaults = () => {
    setProcesses(INITIAL_SAMPLE_PROCESSES);
    setResources(DEFAULT_RESOURCES);
    setQuantum(2);
    setSelectedAlgorithm("FCFS");
    logEvent("Sample workload restored: P1, P2, P3, P4");
  };

  // Request Resource
  const handleRequestResource = (pid, resourceName, quantity) => {
    const qty = Number(quantity);
    const available = resources.available[resourceName] || 0;

    if (qty > available) {
      logEvent(`Process ${pid} requested ${qty} unit(s) of ${resourceName} — DENIED (Insufficient capacity)`);
      return {
        success: false,
        message: `Resource unavailable (${available} free). Process ${pid} must wait.`,
      };
    }

    const updatedAvailable = {
      ...resources.available,
      [resourceName]: available - qty,
    };

    const currentProcessAlloc = resources.allocations[pid] || {
      Printer: 0,
      Scanner: 0,
      Disk: 0,
      Network: 0,
    };

    const updatedAllocations = {
      ...resources.allocations,
      [pid]: {
        ...currentProcessAlloc,
        [resourceName]: (currentProcessAlloc[resourceName] || 0) + qty,
      },
    };

    setResources({
      available: updatedAvailable,
      allocations: updatedAllocations,
    });

    logEvent(`${resourceName} allocated to ${pid} (${qty} unit)`);
    return {
      success: true,
      message: `Successfully allocated ${qty} unit(s) of ${resourceName} to ${pid}.`,
    };
  };

  // Release Resource
  const handleReleaseResource = (pid, resourceName, quantity) => {
    const qty = Number(quantity);
    const pAlloc = resources.allocations[pid] || {};
    const currentlyHeld = pAlloc[resourceName] || 0;

    if (qty > currentlyHeld) {
      return {
        success: false,
        message: `Cannot release ${qty} units. Process ${pid} only holds ${currentlyHeld} units of ${resourceName}.`,
      };
    }

    const updatedAvailable = {
      ...resources.available,
      [resourceName]: (resources.available[resourceName] || 0) + qty,
    };

    const updatedAllocations = {
      ...resources.allocations,
      [pid]: {
        ...pAlloc,
        [resourceName]: currentlyHeld - qty,
      },
    };

    setResources({
      available: updatedAvailable,
      allocations: updatedAllocations,
    });

    logEvent(`${qty} unit(s) of ${resourceName} released by ${pid}`);
    return {
      success: true,
      message: `Released ${qty} unit(s) of ${resourceName} from ${pid}.`,
    };
  };

  // Reset Resource Pool
  const handleResetResources = () => {
    setResources(DEFAULT_RESOURCES);
    logEvent("Hardware resource pool reset to defaults");
  };

  // Page title mapping
  const pageTitles = {
    dashboard: {
      title: mode === "live" ? "Live PC Hardware & Process Monitor" : "OS-TaskFlow Dashboard",
      subtitle: mode === "live"
        ? `Real-time host inspection: ${systemOverview?.cpuModel || "CPU"} • ${systemOverview?.hostname || "Localhost"}`
        : "Process Scheduling and Resource Management Overview",
    },
    processes: {
      title: "Process Manager",
      subtitle: "Inspect real Windows tasks or manage simulated processes and lifecycle states",
    },
    scheduler: {
      title: "CPU Scheduling Laboratory",
      subtitle: "Simulate and analyze CPU scheduling algorithms on live or synthetic workloads",
    },
    comparison: {
      title: "CPU Scheduling Comparison",
      subtitle: "Benchmark multiple scheduling algorithms on identical workloads",
    },
    resources: {
      title: "Resource Manager",
      subtitle: "Physical computer hardware devices and simulated device allocation",
    },
    deadlock: {
      title: "Deadlock & Safety Analyzer",
      subtitle: "Banker's Safety Algorithm & sequence computation",
    },
    about: {
      title: "About OS-TaskFlow",
      subtitle: "Interactive Process Scheduling and Resource Management Simulator",
    },
  };

  const currentHeaderInfo = pageTitles[activePage] || pageTitles.dashboard;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Fixed Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={currentHeaderInfo.title}
          subtitle={currentHeaderInfo.subtitle}
          mode={mode}
          setMode={setMode}
          isHostConnected={isHostConnected}
          onRestoreDefaults={handleRestoreDefaults}
          onRefreshLive={refreshSystemData}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activePage === "dashboard" && (
            <Dashboard
              mode={mode}
              systemOverview={systemOverview}
              liveMetrics={liveMetrics}
              liveProcesses={liveProcesses}
              processes={processes}
              events={events}
              schedulerMetrics={latestMetrics}
              onNavigate={(page) => setActivePage(page)}
              onImportLiveProcesses={handleImportLiveProcesses}
            />
          )}

          {activePage === "processes" && (
            <ProcessManager
              processes={processes}
              liveProcesses={liveProcesses}
              onAddProcess={handleAddProcess}
              onUpdateProcess={handleUpdateProcess}
              onDeleteProcess={handleDeleteProcess}
              onStateChange={handleStateChange}
              onResetAll={handleResetAll}
              onRestoreDefaults={handleRestoreDefaults}
              onImportLiveProcesses={handleImportLiveProcesses}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === "scheduler" && (
            <CpuScheduler
              processes={processes}
              liveProcesses={liveProcesses}
              quantum={quantum}
              setQuantum={setQuantum}
              selectedAlgorithm={selectedAlgorithm}
              setSelectedAlgorithm={setSelectedAlgorithm}
              onRecordMetrics={(m) => setLatestMetrics(m)}
              onNavigate={(page) => setActivePage(page)}
              onImportLiveProcesses={handleImportLiveProcesses}
              onRestoreDefaults={handleRestoreDefaults}
            />
          )}

          {activePage === "comparison" && (
            <AlgorithmComparison
              processes={processes}
              quantum={quantum}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === "resources" && (
            <ResourceManager
              mode={mode}
              systemOverview={systemOverview}
              liveMetrics={liveMetrics}
              disks={disks}
              resources={resources}
              processes={processes}
              onRequestResource={handleRequestResource}
              onReleaseResource={handleReleaseResource}
              onResetResources={handleResetResources}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === "deadlock" && (
            <DeadlockAnalyzer
              bankerData={bankerData}
              setBankerData={setBankerData}
            />
          )}

          {activePage === "about" && <About />}
        </main>
      </div>
    </div>
  );
}
