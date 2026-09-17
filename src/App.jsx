import React, { useState, useEffect } from "react";
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

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [processes, setProcesses] = useState(getStoredProcesses);
  const [quantum, setQuantum] = useState(getStoredQuantum);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(getStoredAlgorithm);
  const [resources, setResources] = useState(getStoredResources);
  const [bankerData, setBankerData] = useState(getStoredBankerData);
  const [events, setEvents] = useState(getStoredEvents);
  const [latestMetrics, setLatestMetrics] = useState(null);

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

  const logEvent = (message) => {
    const updated = addStoredEvent(message);
    setEvents(updated);
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

    // Also remove process from resource allocations if any
    const updatedAllocations = { ...resources.allocations };
    if (updatedAllocations[pid]) {
      // Return held resources to available pool
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

  // State Transitions (NEW -> READY -> RUNNING -> WAITING -> READY -> TERMINATED)
  const handleStateChange = (pid, targetState) => {
    const p = processes.find((item) => item.id === pid);
    if (!p) return;

    const currentState = p.state || "NEW";

    // Validate transition
    const allowed = ALLOWED_STATE_TRANSITIONS[currentState] || [];
    if (!allowed.includes(targetState)) {
      alert(`Invalid transition from ${currentState} to ${targetState} according to OS process lifecycle rules.`);
      return;
    }

    // If moving to RUNNING, ensure no two processes are marked RUNNING at once in a single CPU model
    let updated = processes.map((item) => {
      if (item.id === pid) {
        return { ...item, state: targetState };
      }
      if (targetState === "RUNNING" && item.state === "RUNNING") {
        // Preempt previous running process back to READY
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
      title: "OS-TaskFlow Dashboard",
      subtitle: "Process Scheduling and Resource Management Overview",
    },
    processes: {
      title: "Process Manager",
      subtitle: "Create and manage simulated operating system processes",
    },
    scheduler: {
      title: "CPU Scheduling Laboratory",
      subtitle: "Simulate and analyze CPU scheduling algorithms",
    },
    comparison: {
      title: "CPU Scheduling Comparison",
      subtitle: "Benchmark multiple scheduling algorithms on identical workloads",
    },
    resources: {
      title: "Resource Manager",
      subtitle: "Simulate allocation and release of limited system resources",
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
          onRestoreDefaults={handleRestoreDefaults}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {activePage === "dashboard" && (
            <Dashboard
              processes={processes}
              events={events}
              schedulerMetrics={latestMetrics}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === "processes" && (
            <ProcessManager
              processes={processes}
              onAddProcess={handleAddProcess}
              onUpdateProcess={handleUpdateProcess}
              onDeleteProcess={handleDeleteProcess}
              onStateChange={handleStateChange}
              onResetAll={handleResetAll}
              onRestoreDefaults={handleRestoreDefaults}
            />
          )}

          {activePage === "scheduler" && (
            <CpuScheduler
              processes={processes}
              quantum={quantum}
              setQuantum={setQuantum}
              selectedAlgorithm={selectedAlgorithm}
              setSelectedAlgorithm={setSelectedAlgorithm}
              onRecordMetrics={(m) => setLatestMetrics(m)}
              onNavigate={(page) => setActivePage(page)}
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
