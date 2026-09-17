import React from "react";
import { Terminal, RefreshCw } from "lucide-react";

export default function Header({ title, subtitle, onRestoreDefaults }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onRestoreDefaults && (
          <button
            onClick={onRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
            title="Restore P1-P4 sample workload"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reset Sample Data</span>
          </button>
        )}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono">
          <Terminal className="w-3.5 h-3.5 text-blue-600" />
          <span>Localhost Simulation</span>
        </div>
      </div>
    </header>
  );
}
