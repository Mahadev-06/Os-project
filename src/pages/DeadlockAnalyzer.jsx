import React, { useState, useEffect } from "react";
import BankerTable from "../components/BankerTable";
import { runBankerSafety } from "../algorithms/banker";
import { Info } from "lucide-react";

export default function DeadlockAnalyzer({ bankerData, setBankerData }) {
  const [safetyResult, setSafetyResult] = useState(null);

  // Automatically run safety analysis on mount or data change
  useEffect(() => {
    handleCheckSafety();
  }, [bankerData]);

  const handleUpdateAvailable = (resourceIndex, value) => {
    const val = Number(value);
    const updated = [...bankerData.available];
    updated[resourceIndex] = isNaN(val) || val < 0 ? 0 : val;
    setBankerData({ ...bankerData, available: updated });
  };

  const handleUpdateProcessValue = (processIndex, matrixType, resourceIndex, value) => {
    const val = Number(value);
    const sanitizedVal = isNaN(val) || val < 0 ? 0 : val;

    const updatedProcesses = bankerData.processes.map((p, idx) => {
      if (idx !== processIndex) return p;
      const matrix = [...p[matrixType]];
      matrix[resourceIndex] = sanitizedVal;
      return { ...p, [matrixType]: matrix };
    });

    setBankerData({ ...bankerData, processes: updatedProcesses });
  };

  const handleAddProcess = () => {
    if (bankerData.processes.length >= 5) return;
    const nextId = `P${bankerData.processes.length}`;
    const newProcess = {
      id: nextId,
      allocation: [0, 0, 0],
      max: [1, 1, 1],
    };
    setBankerData({
      ...bankerData,
      processes: [...bankerData.processes, newProcess],
    });
  };

  const handleRemoveProcess = (index) => {
    if (bankerData.processes.length <= 3) return;
    const updated = bankerData.processes.filter((_, idx) => idx !== index);
    setBankerData({ ...bankerData, processes: updated });
  };

  const handleLoadPreset = (preset) => {
    setBankerData(preset);
  };

  const handleCheckSafety = () => {
    const result = runBankerSafety(bankerData.available, bankerData.processes);
    setSafetyResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Banker Component */}
      <BankerTable
        bankerData={bankerData}
        onUpdateAvailable={handleUpdateAvailable}
        onUpdateProcessValue={handleUpdateProcessValue}
        onAddProcess={handleAddProcess}
        onRemoveProcess={handleRemoveProcess}
        onLoadPreset={handleLoadPreset}
        safetyResult={safetyResult}
        onCheckSafety={handleCheckSafety}
      />

      {/* Educational Concept Guide */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-5">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Understanding Banker's Safety Algorithm</h4>
            <p className="leading-relaxed">
              The Banker's Algorithm avoids deadlocks by simulating allocation for predetermined maximum possible amounts of all resources, and then runs an 's-state' check to test for possible activities, before deciding whether allocation should be allowed to continue.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 font-sans">1. Need Matrix</span>
                <span className="text-slate-600">Need[i][j] = Max[i][j] − Allocation[i][j]</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 font-sans">2. Work Vector</span>
                <span className="text-slate-600">Work = Available resources currently free</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 font-sans">3. Safety Criterion</span>
                <span className="text-slate-600">Need[i] ≤ Work ⇒ Work = Work + Allocation[i]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
