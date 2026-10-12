import React, { useState } from "react";
import ProcessForm from "../components/ProcessForm";
import ProcessTable from "../components/ProcessTable";
import ProcessModal from "../components/ProcessModal";
import { RefreshCw, Trash2, AlertTriangle, Cpu, Terminal, Search, Zap, Check } from "lucide-react";

export default function ProcessManager({
  processes,
  liveProcesses = [],
  onAddProcess,
  onUpdateProcess,
  onDeleteProcess,
  onStateChange,
  onResetAll,
  onRestoreDefaults,
  onImportLiveProcesses,
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState("simulated"); // "simulated" | "live"
  const [editingProcess, setEditingProcess] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [importedNotice, setImportedNotice] = useState(null);

  const existingPids = processes.map((p) => p.id);

  // Filter live processes by search
  const filteredLiveProcesses = liveProcesses.filter((p) =>
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.realPid || "").includes(searchQuery)
  );

  const handleImportSingle = (lp) => {
    const newProc = {
      id: `P-${lp.name.replace(".exe", "").substring(0, 8)}`,
      arrivalTime: 0,
      burstTime: lp.burstTime || 4,
      priority: lp.priority || 2,
      memory: lp.memoryMb || 128,
      state: "READY",
    };
    onAddProcess(newProc);
    setImportedNotice(`Imported "${lp.name}" (PID ${lp.realPid}) into scheduler workload.`);
    setTimeout(() => setImportedNotice(null), 3000);
  };

  const handleImportTopBatch = () => {
    if (onImportLiveProcesses && liveProcesses.length > 0) {
      onImportLiveProcesses(liveProcesses.slice(0, 4));
      setImportedNotice(`Imported top 4 active Windows processes into scheduler workload!`);
      setTimeout(() => setImportedNotice(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab("simulated")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === "simulated"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Simulated Workload ({processes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === "live"
                ? "bg-white text-blue-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Real Windows Tasks ({liveProcesses.length})</span>
          </button>
        </div>

        {activeTab === "simulated" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Restore P1–P4</span>
            </button>

            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear All</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleImportTopBatch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Import Top 4 Tasks to Scheduler</span>
          </button>
        )}
      </div>

      {/* Import Notification Banner */}
      {importedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{importedNotice}</span>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("scheduler")}
              className="text-blue-700 font-bold hover:underline"
            >
              View in Scheduler →
            </button>
          )}
        </div>
      )}

      {/* Confirmation Dialogs */}
      {showConfirmReset && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Restore sample workload (P1–P4)?</p>
              <p className="text-amber-700 mt-0.5">
                This will reset the current process table to the initial laboratory sample dataset.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-2.5 py-1 rounded border border-amber-300 bg-white text-slate-700 hover:bg-amber-100/50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onRestoreDefaults();
                setShowConfirmReset(false);
              }}
              className="px-2.5 py-1 rounded bg-amber-600 text-white font-medium hover:bg-amber-700"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      )}

      {showConfirmClear && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Delete all processes?</p>
              <p className="text-rose-700 mt-0.5">
                This will wipe all active processes from the simulator and localStorage.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-2.5 py-1 rounded border border-rose-300 bg-white text-slate-700 hover:bg-rose-100/50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onResetAll();
                setShowConfirmClear(false);
              }}
              className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium hover:bg-rose-700"
            >
              Delete All
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === "simulated" ? (
        <>
          {/* Process Creation Form */}
          <ProcessForm onAddProcess={onAddProcess} existingPids={existingPids} />

          {/* Process Table Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Active Workload ({processes.length})</h3>
              <span className="text-xs text-slate-400">
                Click lifecycle buttons to simulate state transitions (Start, Wait, Resume, Terminate)
              </span>
            </div>
            <ProcessTable
              processes={processes}
              onStateChange={onStateChange}
              onEditProcess={(p) => setEditingProcess(p)}
              onDeleteProcess={onDeleteProcess}
            />
          </div>
        </>
      ) : (
        /* Real Windows Tasks Explorer */
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Live Windows Process Explorer</h3>
              <p className="text-xs text-slate-500">
                Real applications running on your machine with genuine memory and thread priority
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search processes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-mono">PID</th>
                  <th className="py-2.5 px-4">Process Name</th>
                  <th className="py-2.5 px-4 text-center font-mono">RAM (MB)</th>
                  <th className="py-2.5 px-4 text-center font-mono">CPU (Sec)</th>
                  <th className="py-2.5 px-4 text-center font-mono">Base Priority</th>
                  <th className="py-2.5 px-4 text-right">Scheduler Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredLiveProcesses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No matching live Windows tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredLiveProcesses.map((lp) => (
                    <tr key={lp.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{lp.realPid || lp.id}</td>
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-800">{lp.name}</td>
                      <td className="py-2.5 px-4 text-center text-slate-700">{lp.memoryMb} MB</td>
                      <td className="py-2.5 px-4 text-center text-slate-600">{lp.cpuSeconds}s</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-sans ${
                          lp.priority === 1 ? "bg-blue-50 text-blue-700 font-bold border border-blue-200" : "bg-slate-100 text-slate-600"
                        }`}>
                          {lp.rawPriority || 8} ({lp.priority === 1 ? "High" : lp.priority === 3 ? "Idle" : "Normal"})
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleImportSingle(lp)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                        >
                          + Add to Scheduler
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Process Modal */}
      <ProcessModal
        isOpen={Boolean(editingProcess)}
        process={editingProcess}
        onClose={() => setEditingProcess(null)}
        onSave={(updated) => onUpdateProcess(updated)}
      />
    </div>
  );
}
