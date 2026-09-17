import React, { useState } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";

export default function ProcessForm({ onAddProcess, existingPids = [] }) {
  const [pid, setPid] = useState("");
  const [arrivalTime, setArrivalTime] = useState("0");
  const [burstTime, setBurstTime] = useState("");
  const [priority, setPriority] = useState("1");
  const [memory, setMemory] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const trimmedPid = pid.trim().toUpperCase();

    // 1. Validate Process ID
    if (!trimmedPid) {
      setError("Process ID is required (e.g., P5).");
      return;
    }
    if (existingPids.map((p) => p.toUpperCase()).includes(trimmedPid)) {
      setError(`Process ID "${trimmedPid}" already exists. Please choose a unique identifier.`);
      return;
    }

    // 2. Validate Arrival Time
    const arrivalNum = Number(arrivalTime);
    if (arrivalTime === "" || isNaN(arrivalNum) || !Number.isInteger(arrivalNum) || arrivalNum < 0) {
      setError("Arrival Time is required and must be an integer ≥ 0.");
      return;
    }

    // 3. Validate Burst Time
    const burstNum = Number(burstTime);
    if (burstTime === "" || isNaN(burstNum) || !Number.isInteger(burstNum) || burstNum <= 0) {
      setError("Burst Time is required and must be an integer > 0.");
      return;
    }

    // 4. Validate Priority
    const priorityNum = Number(priority);
    if (priority === "" || isNaN(priorityNum) || !Number.isInteger(priorityNum) || priorityNum < 1) {
      setError("Priority is required and must be an integer ≥ 1 (lower number = higher priority).");
      return;
    }

    // 5. Validate Memory (optional)
    let memVal = null;
    if (memory.trim() !== "") {
      const memNum = Number(memory);
      if (isNaN(memNum) || !Number.isInteger(memNum) || memNum <= 0) {
        setError("Memory Required must be an integer > 0 if provided.");
        return;
      }
      memVal = memNum;
    }

    // Construct new process with default state "NEW"
    const newProcess = {
      id: trimmedPid,
      arrivalTime: arrivalNum,
      burstTime: burstNum,
      priority: priorityNum,
      memory: memVal,
      state: "NEW",
    };

    onAddProcess(newProcess);

    // Auto increment next suggested PID
    const nextNum = existingPids.length + 2;
    setPid(`P${nextNum}`);
    setBurstTime("");
    setMemory("");
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Add New Process</h3>
          <p className="text-xs text-slate-500">Define process execution parameters</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end">
        {/* PID */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            PID <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            placeholder="e.g. P5"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
          />
        </div>

        {/* Arrival Time */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Arrival Time <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
          />
        </div>

        {/* Burst Time */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Burst Time <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={burstTime}
            onChange={(e) => setBurstTime(e.target.value)}
            placeholder="e.g. 4"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Priority <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
          />
        </div>

        {/* Memory */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Memory (MB) <span className="text-slate-400 font-normal">opt</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            placeholder="e.g. 128"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Process</span>
          </button>
        </div>
      </form>
    </div>
  );
}
