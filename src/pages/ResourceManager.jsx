import React, { useState } from "react";
import ResourceTable from "../components/ResourceTable";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function ResourceManager({
  resources,
  processes,
  onRequestResource,
  onReleaseResource,
  onResetResources,
}) {
  const [selectedProcess, setSelectedProcess] = useState(processes[0]?.id || "");
  const [selectedResource, setSelectedResource] = useState("Printer");
  const [requestQty, setRequestQty] = useState("1");

  const [releaseProcess, setReleaseProcess] = useState(processes[0]?.id || "");
  const [releaseResource, setReleaseResource] = useState("Printer");
  const [releaseQty, setReleaseQty] = useState("1");

  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const resourceTypes = ["Printer", "Scanner", "Disk", "Network"];

  const handleRequest = (e) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (!selectedProcess) {
      setErrorMessage("Please select a process.");
      return;
    }

    const qty = Number(requestQty);
    if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      setErrorMessage("Quantity must be a positive integer > 0.");
      return;
    }

    const result = onRequestResource(selectedProcess, selectedResource, qty);
    if (!result.success) {
      setErrorMessage(result.message); // e.g. "Resource unavailable. Process must wait."
    } else {
      setMessage(result.message);
    }
  };

  const handleRelease = (e) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (!releaseProcess) {
      setErrorMessage("Please select a process.");
      return;
    }

    const qty = Number(releaseQty);
    if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      setErrorMessage("Release quantity must be a positive integer > 0.");
      return;
    }

    const result = onReleaseResource(releaseProcess, releaseResource, qty);
    if (!result.success) {
      setErrorMessage(result.message);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex items-center justify-end">
        <button
          onClick={onResetResources}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Reset Hardware Pool</span>
        </button>
      </div>

      {/* Available Resource Counters */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Available Resource Pool Counts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {resourceTypes.map((res) => {
            const count = resources.available[res] ?? 0;
            return (
              <div
                key={res}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-medium text-slate-500">{res}</span>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{count}</p>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    count > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                  }`}
                >
                  {count > 0 ? "Available" : "Exhausted"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Notifications */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Operations Grid: Request & Release */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Resource Box */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Request Resource</h3>
          <p className="text-xs text-slate-500 mb-4">
            Process requests allocation from the system's available resource pool.
          </p>

          <form onSubmit={handleRequest} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Process</label>
              <select
                value={selectedProcess}
                onChange={(e) => setSelectedProcess(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-mono outline-none bg-white"
              >
                {processes.length === 0 ? (
                  <option value="">No active processes</option>
                ) : (
                  processes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} ({p.state || "READY"})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Resource</label>
                <select
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded outline-none bg-white font-mono"
                >
                  {resourceTypes.map((r) => (
                    <option key={r} value={r}>
                      {r} (avail: {resources.available[r] ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={requestQty}
                  onChange={(e) => setRequestQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processes.length === 0}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-bold transition-colors shadow-sm mt-2"
            >
              Request Resource
            </button>
          </form>
        </div>

        {/* Release Resource Box */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Release Resource</h3>
          <p className="text-xs text-slate-500 mb-4">
            Process relinquishes held resources back to the pool upon task or I/O completion.
          </p>

          <form onSubmit={handleRelease} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Process</label>
              <select
                value={releaseProcess}
                onChange={(e) => setReleaseProcess(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-mono outline-none bg-white"
              >
                {processes.length === 0 ? (
                  <option value="">No active processes</option>
                ) : (
                  processes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Resource</label>
                <select
                  value={releaseResource}
                  onChange={(e) => setReleaseResource(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded outline-none bg-white font-mono"
                >
                  {resourceTypes.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={releaseQty}
                  onChange={(e) => setReleaseQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processes.length === 0}
              className="w-full py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-bold transition-colors shadow-sm mt-2"
            >
              Release Resource
            </button>
          </form>
        </div>
      </div>

      {/* Allocation Table */}
      <ResourceTable
        resources={resources}
        processes={processes}
        onReleaseResource={onReleaseResource}
      />
    </div>
  );
}
