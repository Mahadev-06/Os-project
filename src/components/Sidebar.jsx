import React from "react";
import {
  LayoutDashboard,
  Cpu,
  Clock,
  BarChart3,
  Server,
  ShieldAlert,
  Info,
  Layers,
} from "lucide-react";

export default function Sidebar({ activePage, setActivePage }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "processes", label: "Process Manager", icon: Cpu },
    { id: "scheduler", label: "CPU Scheduler", icon: Clock },
    { id: "comparison", label: "Algorithm Comparison", icon: BarChart3 },
    { id: "resources", label: "Resource Manager", icon: Server },
    { id: "deadlock", label: "Deadlock & Security Guard", icon: ShieldAlert },
    { id: "about", label: "About Project", icon: Info },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-white tracking-tight text-base">OS-TaskFlow</h1>
            <p className="text-xs text-slate-400">OS Laboratory Simulator</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding required by user:
          OS-TaskFlow
          Operating Systems Simulator
      */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="text-xs font-semibold text-slate-300">OS-TaskFlow</div>
        <div className="text-[11px] text-slate-400">Operating Systems Simulator</div>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>v1.0.0 • Academic Build</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
      </div>
    </aside>
  );
}
