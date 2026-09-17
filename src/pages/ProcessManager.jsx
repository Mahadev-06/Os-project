import React, { useState } from "react";
import ProcessForm from "../components/ProcessForm";
import ProcessTable from "../components/ProcessTable";
import ProcessModal from "../components/ProcessModal";
import { RefreshCw, Trash2, AlertTriangle } from "lucide-react";

export default function ProcessManager({
  processes,
  onAddProcess,
  onUpdateProcess,
  onDeleteProcess,
  onStateChange,
  onResetAll,
  onRestoreDefaults,
}) {
  const [editingProcess, setEditingProcess] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const existingPids = processes.map((p) => p.id);

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Restore Sample Data (P1–P4)</span>
          </button>

          <button
            onClick={() => setShowConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear All</span>
          </button>
        </div>

      {/* Confirmation Dialog for Restore Defaults */}
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

      {/* Confirmation Dialog for Clear All */}
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

      {/* Process Creation Form */}
      <ProcessForm onAddProcess={onAddProcess} existingPids={existingPids} />

      {/* Process Table Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-800">Active Processes ({processes.length})</h3>
          <span className="text-xs text-slate-400">
            Click lifecycle buttons to simulate transitions (e.g. Start, Wait, Resume, Terminate)
          </span>
        </div>
        <ProcessTable
          processes={processes}
          onStateChange={onStateChange}
          onEditProcess={(p) => setEditingProcess(p)}
          onDeleteProcess={onDeleteProcess}
        />
      </div>

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
