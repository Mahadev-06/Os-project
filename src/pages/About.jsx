import React from "react";
import { BookOpen, Target, Cpu, Compass, Layers, CheckCircle2 } from "lucide-react";

export default function About() {
  const concepts = [
    "Process Management & Lifecycle",
    "Process States (NEW, READY, RUNNING, WAITING, TERMINATED)",
    "Ready Queue Operations",
    "CPU Scheduling Principles",
    "First Come First Serve (FCFS)",
    "Shortest Job First (SJF Non-preemptive)",
    "Priority Scheduling (Non-preemptive)",
    "Round Robin (RR) with Time Quantum",
    "Waiting Time Calculation",
    "Turnaround Time Calculation",
    "Response Time Calculation",
    "Resource Allocation & Contention",
    "Deadlock Avoidance",
    "Dijkstra's Banker's Algorithm",
  ];

  const futureScope = [
    { title: "Memory Management", desc: "Paging, segmentation, and fragmentation analysis" },
    { title: "Page Replacement Algorithms", desc: "FIFO, LRU, and Optimal page replacement policies" },
    { title: "Disk Scheduling", desc: "FCFS, SSTF, SCAN, C-SCAN, and LOOK disk seek simulations" },
    { title: "Process Synchronization", desc: "Semaphores, mutexes, and classic problems (Producer-Consumer, Dining Philosophers)" },
    { title: "File Allocation Strategies", desc: "Contiguous, linked, and indexed file storage methods" },
  ];

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Title & Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">About OS-TaskFlow</h1>
            <p className="text-xs text-slate-500 font-mono">
              Project Title: <span className="font-bold text-slate-800">OS-TaskFlow</span>
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-blue-700 bg-blue-50/50 py-1 px-2.5 rounded inline-block border border-blue-100 mt-2">
          Interactive Process Scheduling and Resource Management Simulator
        </p>
      </div>

      {/* Problem Statement */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h3>Problem Statement</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Operating System scheduling and resource-management concepts are usually taught using static textbook examples and manual calculations on paper. Students often find it challenging to visualize how processes dynamically advance through internal state queues, how different CPU scheduling algorithms prioritize tasks under diverse arrival patterns, and how subtle timing differences affect turnaround, waiting, and response metrics.
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>OS-TaskFlow</strong> provides a transparent, interactive, and academically rigorous software laboratory for simulating and understanding these core Operating System abstractions directly in a modern web environment.
        </p>
      </div>

      {/* Objectives */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Target className="w-4 h-4 text-emerald-600" />
          <h3>Core Project Objectives</h3>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-700">
          {[
            "Simulate process creation and the 5-state lifecycle",
            "Implement common CPU scheduling algorithms accurately",
            "Visualize execution intervals using Gantt charts",
            "Calculate scheduling performance metrics accurately",
            "Compare algorithms on identical workloads side-by-side",
            "Demonstrate hardware resource allocation and release",
            "Analyze safe and unsafe states using Banker's Algorithm",
          ].map((obj, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded border border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Operating System Concepts Used */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Cpu className="w-4 h-4 text-blue-600" />
          <h3>Operating System Concepts Used</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {concepts.map((concept, idx) => (
            <span
              key={idx}
              className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>

      {/* Future Scope (Marked clearly as Future Scope Only) */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Compass className="w-4 h-4 text-amber-600" />
            <h3>Future Scope (Theoretical Extensions)</h3>
          </div>
          <span className="text-[11px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
            Not implemented in v1.0 • Roadmap
          </span>
        </div>
        <p className="text-xs text-slate-500">
          The following modules represent valuable extensions for upcoming academic research iterations:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {futureScope.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
              <span className="font-bold text-slate-800 block mb-0.5">{item.title}</span>
              <span className="text-slate-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
