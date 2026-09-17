import React from "react";

export default function ResourceTable({
  resources,
  processes,
  onReleaseResource,
}) {
  const resourceNames = ["Printer", "Scanner", "Disk", "Network"];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Resource Allocation Matrix</h3>
          <p className="text-xs text-slate-500">Current allocation of hardware devices per process</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-4">Process</th>
              {resourceNames.map((res) => (
                <th key={res} className="py-2.5 px-4 font-mono text-center">
                  {res}
                </th>
              ))}
              <th className="py-2.5 px-4 text-right">Quick Release</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                  No active processes. Add processes to simulate resource allocation.
                </td>
              </tr>
            ) : (
              processes.map((p) => {
                const pAlloc = resources.allocations[p.id] || {
                  Printer: 0,
                  Scanner: 0,
                  Disk: 0,
                  Network: 0,
                };
                const totalHeld =
                  (pAlloc.Printer || 0) +
                  (pAlloc.Scanner || 0) +
                  (pAlloc.Disk || 0) +
                  (pAlloc.Network || 0);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                    {resourceNames.map((res) => (
                      <td key={res} className="py-3 px-4 font-mono text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            (pAlloc[res] || 0) > 0
                              ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                              : "text-slate-400"
                          }`}
                        >
                          {pAlloc[res] || 0}
                        </span>
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right">
                      {totalHeld > 0 ? (
                        <div className="inline-flex gap-1 justify-end flex-wrap">
                          {resourceNames.map((res) => {
                            const held = pAlloc[res] || 0;
                            if (held <= 0) return null;
                            return (
                              <button
                                key={res}
                                onClick={() => onReleaseResource(p.id, res, 1)}
                                className="px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                                title={`Release 1 unit of ${res} from ${p.id}`}
                              >
                                -1 {res}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None held</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
