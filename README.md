# OS-TaskFlow

## Interactive Process Scheduling and Resource Management Simulator

**OS-TaskFlow** is an interactive, browser-based operating systems simulation platform developed for college Operating Systems laboratories and coursework. It models core OS concepts including process management, the 5-state lifecycle, non-preemptive and preemptive CPU scheduling algorithms, multi-algorithm benchmarking, physical hardware resource contention, and deadlock avoidance via Dijkstra's Banker's Algorithm.

---

## 🛠️ Technology Stack

- **React 18** (Modern functional components, hooks)
- **Vite 6** (Fast, modern bundling with manual chunking)
- **JavaScript (ES Modules)**
- **Tailwind CSS** (Academic laboratory theme: slate sidebar, neutral borders, blue accents)
- **Lucide React** (Crisp vector icons)
- **Recharts** (Minimalist bar and area charts with zero neon/gradients)
- **Browser localStorage** (Persistence across refreshes for workloads, resources, quantum, and Banker matrices)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation & Launch

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Local Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to: **`http://localhost:5173`**

3. **Run Automated Algorithm Verification Tests**:
   ```bash
   npm test
   ```

4. **Create Production Build**:
   ```bash
   npm run build
   ```

---

## 📋 Default Sample Workload

On initial startup, the simulator loads the standard college OS laboratory workload:

| Process ID | Arrival Time | Burst Time | Priority (Lower = Higher) | Memory | Initial State |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **P1** | 0 | 5 | 2 | 128 MB | READY |
| **P2** | 1 | 3 | 1 *(Highest)* | 64 MB | READY |
| **P3** | 2 | 8 | 3 | 256 MB | READY |
| **P4** | 3 | 4 | 2 | 128 MB | READY |

*Clicking **"Reset Sample Data"** in the top header or in Process Manager restores this benchmark configuration at any time.*

---

## 🧭 Application Modules & Features

### 1. Dashboard (`/`)
- **System Stat Cards**: Live counts of Total, Running, Ready, Waiting, and Terminated processes, plus CPU Utilization and Throughput.
- **Process State Lifecycle Visualizer**: Clean cards illustrating the 5-state pipeline (`NEW → READY → RUNNING → WAITING → TERMINATED`) with processes dynamically categorized.
- **Ready Queue Preview**: Real-time horizontal visualizer of processes queued for CPU dispatch (`P1 → P2 → P4`).
- **CPU Activity Signal**: Minimalist processor utilization tracking.
- **System Event Log**: Real-time chronological audit trail of state transitions, resource requests, and scheduling actions.

### 2. Process Manager
- **Validated Process Creator**: Add processes with unique PID, integer arrival time ($\ge 0$), burst time ($> 0$), priority ($\ge 1$), and optional memory requirements.
- **Lifecycle Transition Dispatcher**: Simulate transitions with operating system lifecycle guards:
  - `NEW → READY`
  - `READY → RUNNING`
  - `RUNNING → WAITING`
  - `WAITING → READY`
  - `RUNNING → TERMINATED`
- **Edit & Delete**: Safely modify parameters or delete processes with confirmation dialogs.
- **Persistence**: Workload changes sync to `localStorage` automatically.

### 3. CPU Scheduler
- **Supported Algorithms**:
  1. **First-Come, First-Served (FCFS)**: Non-preemptive, stable arrival ordering, accounts for CPU idle gaps.
  2. **Shortest Job First (SJF Non-preemptive)**: Evaluates only arrived processes at time $t$, choosing the minimum burst duration.
  3. **Priority Scheduling (Non-preemptive)**: Evaluates arrived processes selecting lowest integer priority.
  4. **Round Robin (RR)**: Preemptive time-sliced scheduling with configurable Time Quantum $q$ (default $q=2$). Accurately enqueues newly arrived tasks before rotating the current preempted slice.
- **Gantt Chart**: Muted horizontal timeline blocks displaying PID, duration, start/end timestamps, and hatched `IDLE` slots.
- **Detailed Metrics Table**: Displays Arrival, Burst, Start Time, Completion Time, Waiting Time, Turnaround Time, and Response Time per process.
- **Summary KPIs**: Average Waiting Time, Average Turnaround Time, Average Response Time, CPU Utilization percentage, and Throughput.

### 4. Algorithm Comparison
- **One-Click Benchmark**: Runs FCFS, SJF, Priority, and Round Robin on the identical workload.
- **Side-by-Side Matrix**: Compare all 5 metrics simultaneously across algorithms.
- **Comparative Visuals**: Minimal Recharts bar charts comparing Average Waiting Time and Average Turnaround Time.
- **Academic Findings**: Highlights which algorithm produced the lowest average waiting time on the workload, with note that optimality depends on workload variance.

### 5. Resource Manager
- **Hardware Device Pools**:
  - Printer: 1 unit
  - Scanner: 1 unit
  - Disk: 2 units
  - Network: 2 units
- **Request Resource**: Verifies device pool availability. If insufficient, displays *"Resource unavailable. Process must wait."*
- **Release Resource**: Process relinquishes devices back to the pool; prevents over-releasing.
- **Live Allocation Matrix**: Real-time matrix of devices held by each process.

### 6. Deadlock & Safety Analyzer (Banker's Algorithm)
- **Resource Types**: A, B, C
- **Interactive Matrices**:
  - Available Vector $[A, B, C]$
  - Allocation Matrix $[n \times 3]$
  - Maximum Matrix $[n \times 3]$
  - Auto-calculated Need Matrix: $\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$
- **Safety Verification**:
  - Identifies **SAFE STATE** with exact Safe Sequence banner (e.g., $P1 \rightarrow P3 \rightarrow P4 \rightarrow P0 \rightarrow P2$).
  - Identifies **UNSAFE STATE** when deadlock risk exists.
  - Full step-by-step trace showing Work vector progression and reclaimed resources.
- **Quick Presets**: "Standard Safe Case (5 Processes)" and "Deadlock / Unsafe Case" for live demonstration.

### 7. About Project
- Problem statement, laboratory learning objectives, mapped operating system syllabus concepts, and clearly delineated future scope (Memory Management, Page Replacement, Disk Scheduling, Synchronization).

---

## 🧪 Verification & Test Suite

The automated verification suite tests all core edge cases:

```bash
npm test
```

Tests included:
1. **TEST 1**: FCFS Arrival Order and idle handling
2. **TEST 2**: SJF Smallest Burst Selection (Same Arrival)
3. **TEST 3**: SJF Arrival-Aware Selection (Must not pick unarrived processes)
4. **TEST 4**: Priority Scheduling (Lower integer = Higher priority)
5. **TEST 5**: Round Robin specific time slices and response/completion times
6. **TEST 6**: Banker's Algorithm Safe Sequence & Unsafe State detection
7. **TEST 7**: CPU Idle Time Gaps and utilization calculation

---

## 📜 Academic Integrity & Design Guidelines

- **Academic / Engineering Aesthetic**: Designed to feel like clean university laboratory software.
- **Zero Distractions**: No neon gradients, no glassmorphism blur, no dark hacker themes, no unnecessary dependencies.
- **Zero Backend Dependencies**: Fully functional offline on `localhost`.
