import React from "react";

export default function StatCard({ label, value, subtext, icon: Icon, color = "blue" }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    slate: "text-slate-600 bg-slate-100 border-slate-200",
    purple: "text-indigo-600 bg-indigo-50 border-indigo-100",
  };

  const badgeStyle = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      {Icon && (
        <div className={`p-2 rounded-md border ${badgeStyle}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
