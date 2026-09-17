import React from "react";

export default function MetricCard({ label, value, unit = "", description, highlight = false }) {
  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        highlight
          ? "bg-blue-50/50 border-blue-200"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono text-slate-900">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
      </div>
      {description && <div className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</div>}
    </div>
  );
}
