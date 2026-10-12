import React from "react";
import { Terminal, RefreshCw, Activity, Cpu } from "lucide-react";

export default function Header({
  title,
  subtitle,
  mode = "live",
  setMode,
  isHostConnected = true,
  onRestoreDefaults,
  onRefreshLive,
  isRefreshing = false,
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-2xs">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {mode === "live" ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live PC
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Simulation Lab
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Mode Switcher Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setMode("live")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              mode === "live"
                ? "bg-white text-blue-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Inspect real Windows processes and PC hardware"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Real PC Mode</span>
          </button>
          <button
            onClick={() => setMode("simulation")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              mode === "simulation"
                ? "bg-white text-blue-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Switch to textbook P1-P4 simulation models"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Sim Lab Mode</span>
          </button>
        </div>

        {/* Action button based on mode */}
        {mode === "live" ? (
          <button
            onClick={onRefreshLive}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors"
            title="Fetch real-time snapshot of Windows processes and hardware"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Live Data</span>
          </button>
        ) : (
          onRestoreDefaults && (
            <button
              onClick={onRestoreDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition-colors"
              title="Restore P1-P4 sample workload"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Reset Sample Data</span>
            </button>
          )
        )}
      </div>
    </header>
  );
}
