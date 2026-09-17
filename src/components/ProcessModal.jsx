import React, { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";

export default function ProcessModal({ process, isOpen, onClose, onSave }) {
  if (!isOpen || !process) return null;

  const [arrivalTime, setArrivalTime] = useState(String(process.arrivalTime));
  const [burstTime, setBurstTime] = useState(String(process.burstTime));
  const [priority, setPriority] = useState(String(process.priority));
  const [memory, setMemory] = useState(process.memory ? String(process.memory) : "");
  const [state, setState] = useState(process.state || "READY");
  const [error, setError] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setError(null);

    const arr = Number(arrivalTime);
    if (arrivalTime === "" || isNaN(arr) || !Number.isInteger(arr) || arr < 0) {
      setError("Arrival Time must be an integer ≥ 0.");
      return;
    }

    const burst = Number(burstTime);
    if (burstTime === "" || isNaN(burst) || !Number.isInteger(burst) || burst <= 0) {
      setError("Burst Time must be an integer > 0.");
      return;
    }

    const prio = Number(priority);
    if (priority === "" || isNaN(prio) || !Number.isInteger(prio) || prio < 1) {
      setError("Priority must be an integer ≥ 1.");
      return;
    }

    let memVal = null;
    if (memory.trim() !== "") {
      const memNum = Number(memory);
      if (isNaN(memNum) || !Number.isInteger(memNum) || memNum <= 0) {
        setError("Memory must be an integer > 0.");
        return;
      }
      memVal = memNum;
    }

    onSave({
      ...process,
      arrivalTime: arr,
      burstTime: burst,
      priority: prio,
      memory: memVal,
      state,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Edit Process {process.id}</h3>
            <p className="text-xs text-slate-500">Update scheduling parameters</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Arrival Time</label>
              <input
                type="number"
                min="0"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Burst Time</label>
              <input
                type="number"
                min="1"
                value={burstTime}
                onChange={(e) => setBurstTime(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <input
                type="number"
                min="1"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Memory (MB)</label>
              <input
                type="number"
                min="1"
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded outline-none bg-white font-mono"
            >
              <option value="NEW">NEW</option>
              <option value="READY">READY</option>
              <option value="RUNNING">RUNNING</option>
              <option value="WAITING">WAITING</option>
              <option value="TERMINATED">TERMINATED</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
