# OS-TaskFlow

## Interactive Process Scheduling, Resource Management & Live OS Explorer

**OS-TaskFlow** is an operating systems laboratory and analysis platform designed for university OS courses, viva demonstrations, and practical project evaluations.

It provides a **dual-architecture system**:
1. **🟢 Real PC Mode (Localhost)**: Hooks directly into the host Windows operating system via native Win32 APIs, Desktop Window Manager (`dwmapi.dll`), and process controllers. It monitors genuine hardware metrics (CPU load per core, RAM, disk partitions), actively opened user desktop applications (Brave Browser tabs, VS Code, WhatsApp, PowerPoint, YouTube Music), and all ~350+ live Windows processes.
2. **☁️ Simulation Lab Mode (Cloud / Vercel)**: A portable, self-contained educational lab running non-preemptive and preemptive CPU scheduling algorithms (FCFS, SJF, Priority, Round Robin), dynamic Gantt charts, multi-algorithm benchmarking, and Dijkstra's Banker's Deadlock Algorithm in any web browser.

---

## ⚡ Real PC Mode vs. Vercel Cloud Deployment

| Feature | Localhost (`npm run dev`) | Vercel Deployment (`https://...vercel.app`) |
|:---|:---:|:---:|
| **Operating Mode** | **Live Real PC Mode** 🟢 | **Simulation Lab Mode** ☁️ |
| **Windows Win32 Process Bridge** | ✅ **Active** (Reads local Windows kernel) | ❌ *Blocked by web browser security sandbox* |
| **Open User Apps & Browser Tabs** | ✅ **Real-Time** (Active visible windows) | 🔄 Simulated benchmark processes |
| **All Windows Processes (~350+)** | ✅ **Authentic Live OS Processes** | 🔄 Synthetic academic workload |
| **Live CPU & RAM Hardware Metrics** | ✅ **Direct Windows Host Telemetry** | 🔄 Simulated hardware telemetry |
| **CPU Scheduling Algorithms** | ✅ Supported | ✅ Supported |
| **Interactive Gantt Charts** | ✅ Supported | ✅ Supported |
| **Banker's Algorithm & Deadlock** | ✅ Supported | ✅ Supported |
| **Resource Manager & Device Pools**| ✅ Supported | ✅ Supported |

> [!IMPORTANT]
> **Why does Real PC Mode require running locally?**
> Standard web browsers (Chrome, Brave, Edge) strictly forbid public cloud websites from querying a user's private computer hardware or inspect running desktop apps for security and privacy reasons. Running the project **locally** gives Node.js direct access to your Windows OS to bridge live telemetry safely to your dashboard.

---

## 💻 Step-by-Step Local Setup & Execution Guide

Follow these steps on your Windows computer to run OS-TaskFlow with full **Real PC Mode**:

### Prerequisites
* **Operating System**: Windows 10 or Windows 11 *(for native Win32 Desktop Window & Process APIs)*
* **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **npm**: v9.0.0 or higher (bundled with Node.js)
* **Git**: ([Download Git](https://git-scm.com/))

---

### 1. Clone the Repository
Open your terminal (PowerShell, Command Prompt, or Git Bash) and run:
```bash
git clone https://github.com/Mahadev-06/Os-project.git
cd Os-project
```

### 2. Install Dependencies
Install all required Node.js packages:
```bash
npm install
```

### 3. Launch the Local Development Server & OS Bridge
Start the Vite server and Windows telemetry bridge:
```bash
npm run dev
```

You should see output similar to:
```text
  VITE v6.4.3  ready in 1400 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Open the Web Application
Open your web browser (Brave, Chrome, Edge, etc.) and go to:
👉 **`http://localhost:5173`**

### 5. What You Will See in Localhost:
* **Real PC Indicator**: The header displays a green `Live PC` badge with a pulsing indicator.
* **Open User Apps**: The Dashboard and Process Manager automatically display your actively open windows (e.g. Brave, VS Code, WhatsApp, YouTube Music) and updates every 2 seconds.
* **All Windows Tasks**: View the true total count of all live Windows processes (~350+) with authentic PIDs, RAM usage, and thread priorities.
* **Import to Scheduler**: Click **"+ Add to Scheduler"** on any real Windows process to bring live processes into the CPU scheduling algorithms!

---

## ☁️ Deploying to Vercel (For Online Simulation Demo)

To host the interactive simulation lab online for your teacher and evaluators:

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your **`Os-project`** repository.
4. Keep the default settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.
6. Your site is now live! Anyone visiting the Vercel URL can test the algorithms, adjust quantum sizes, simulate process states, and run Banker's Deadlock checks.

---

## 🔧 Troubleshooting for Local Execution

* **PowerShell Execution Policy Warning**:
  If Windows blocks PowerShell scripts from running, run this in PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
  *(This only applies to the current session and does not alter system-wide security settings).*

* **Port 5173 Already in Use**:
  If port 5173 is busy, run:
  ```bash
  npm run dev -- --port 3000
  ```
  Then visit `http://localhost:3000`.

* **Automated Algorithm Verification Tests**:
  To verify all scheduling edge cases and Banker's algorithm calculations:
  ```bash
  npm test
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
