import React, { useState } from "react";
import ProcessForm from "../components/ProcessForm";
import ProcessTable from "../components/ProcessTable";
import ProcessModal from "../components/ProcessModal";
import {
  RefreshCw,
  Trash2,
  AlertTriangle,
  Cpu,
  Terminal,
  Search,
  Zap,
  Check,
  Filter,
  Globe,
  Music,
  MessageSquare,
  FileText,
  Monitor,
  Server,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [liveFilter, setLiveFilter] = useState("user_apps"); // "user_apps" | "all"
  const [editingProcess, setEditingProcess] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [importedNotice, setImportedNotice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const existingPids = processes.map((p) => p.id);

  const userAppsCount = liveProcesses.filter(
    (p) => p.isUserApp || p.category === "Browser Tab" || p.category === "User Application"
  ).length;

  // Filter live processes by search and category
  const filteredLiveProcesses = liveProcesses.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.name || "").toLowerCase().includes(q) ||
      (p.rawName || "").toLowerCase().includes(q) ||
      (p.windowTitle || "").toLowerCase().includes(q) ||
      (p.detail || "").toLowerCase().includes(q) ||
      String(p.realPid || "").includes(q);

    if (!matchesSearch) return false;
    if (liveFilter === "user_apps") {
      return p.isUserApp || p.category === "Browser Tab" || p.category === "User Application";
    }
    return true;
  });

  const totalLiveMatches = filteredLiveProcesses.length;
  const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalLiveMatches / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLiveProcesses = pageSize === "all"
    ? filteredLiveProcesses
    : filteredLiveProcesses.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

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
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">Live Windows Process Explorer</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real applications, open tabs, and background services with genuine memory and OS thread priority
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter Toggle */}
              <div className="flex items-center bg-white p-0.5 rounded border border-slate-200 text-xs font-medium shadow-2xs">
                <button
                  onClick={() => {
                    setLiveFilter("user_apps");
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                    liveFilter === "user_apps"
                      ? "bg-blue-600 text-white font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Open User Apps Only ({userAppsCount})</span>
                </button>
                <button
                  onClick={() => {
                    setLiveFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                    liveFilter === "all"
                      ? "bg-blue-600 text-white font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>All Tasks ({liveProcesses.length})</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search processes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-mono">PID</th>
                  <th className="py-2.5 px-4">Application / Process</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center font-mono">RAM (MB)</th>
                  <th className="py-2.5 px-4 text-center font-mono">CPU (Sec)</th>
                  <th className="py-2.5 px-4 text-center font-mono">Base Priority</th>
                  <th className="py-2.5 px-4 text-right">Scheduler Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {paginatedLiveProcesses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-sans">
                      No matching live Windows tasks found for this filter.
                    </td>
                  </tr>
                ) : (
                  paginatedLiveProcesses.map((lp) => {
                    const isTab = lp.category === "Browser Tab" || lp.name?.includes("YouTube Music") || lp.name?.includes("LeetCode") || lp.name?.includes("VTOP");
                    const isPowerPoint = lp.rawName?.toLowerCase().includes("powerpnt") || lp.name?.includes("PowerPoint");
                    const isWhatsApp = lp.rawName?.toLowerCase().includes("whatsapp") || lp.name?.includes("WhatsApp");
                    const isMusic = lp.name?.toLowerCase().includes("music") || lp.name?.toLowerCase().includes("youtube");

                    return (
                      <tr key={lp.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{lp.realPid || lp.id}</td>
                        <td className="py-2.5 px-4 font-sans">
                          <div className="flex items-center gap-2">
                            {isMusic ? (
                              <span className="p-1.5 rounded bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                                <Music className="w-3.5 h-3.5" />
                              </span>
                            ) : isPowerPoint ? (
                              <span className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </span>
                            ) : isWhatsApp ? (
                              <span className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </span>
                            ) : isTab ? (
                              <span className="p-1.5 rounded bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                <Globe className="w-3.5 h-3.5" />
                              </span>
                            ) : lp.isUserApp ? (
                              <span className="p-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                <Monitor className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="p-1.5 rounded bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                                <Server className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <span className="truncate">{lp.name}</span>
                                {lp.rawName && lp.rawName !== lp.name && (
                                   <span className="text-[10px] text-slate-400 font-mono shrink-0">({lp.rawName})</span>
                                )}
                              </div>
                              {(lp.windowTitle || lp.detail) && (
                                <p className="text-[11px] text-slate-500 font-sans truncate max-w-sm sm:max-w-md">
                                  {lp.windowTitle || lp.detail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            isTab
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : lp.isUserApp
                              ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>
                            {lp.category || (lp.isUserApp ? "User App" : "System")}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-700">{lp.memoryMb} MB</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">{lp.cpuSeconds}s</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-sans ${
                            lp.priority === 1 ? "bg-blue-50 text-blue-700 font-bold border border-blue-200" : "bg-slate-100 text-slate-600"
                          }`}>
                            Base {lp.rawPriority || 8} ({lp.priority === 1 ? "High" : lp.priority === 3 ? "Idle" : "Normal"})
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleImportSingle(lp)}
                            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors shadow-2xs font-sans"
                          >
                            + Add to Scheduler
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {totalLiveMatches === 0
                    ? 0
                    : pageSize === "all"
                    ? `1–${totalLiveMatches}`
                    : `${(validCurrentPage - 1) * pageSize + 1}–${Math.min(
                        validCurrentPage * pageSize,
                        totalLiveMatches
                      )}`}
                </span>{" "}
                of <span className="font-semibold text-slate-900">{totalLiveMatches}</span> tasks
              </span>

              <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-300">
                <span className="text-slate-500">Per page:</span>
                {[25, 50, 100, "all"].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      pageSize === size
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {size === "all" ? "All" : size}
                  </button>
                ))}
              </div>
            </div>

            {pageSize !== "all" && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage <= 1}
                  className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors shadow-2xs font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <span className="px-2 text-slate-500 font-mono text-[11px]">
                  Page {validCurrentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage >= totalPages}
                  className="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors shadow-2xs font-medium"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
