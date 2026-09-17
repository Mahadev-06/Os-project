/**
 * Banker's Safety Algorithm
 * 
 * Determines whether a system allocation state is SAFE or UNSAFE (deadlock possible).
 * 
 * Parameters:
 * - available: Array of numbers [A, B, C]
 * - processes: Array of { id: string, allocation: [number, number, number], max: [number, number, number] }
 * 
 * Returns:
 * {
 *   isSafe: boolean,
 *   safeSequence: string[],
 *   stepLogs: { step: number, processId: string, workBefore: number[], need: number[], alloc: number[], workAfter: number[] }[],
 *   needMatrix: { id: string, need: number[] }[],
 *   error: string | null
 * }
 */
export function runBankerSafety(available, processes) {
  if (!available || available.length === 0 || !processes || processes.length === 0) {
    return {
      isSafe: false,
      safeSequence: [],
      stepLogs: [],
      needMatrix: [],
      error: "Invalid input: Available resources or processes are missing.",
    };
  }

  const numResources = available.length;
  const numProcesses = processes.length;

  // Validation: Check that no allocation or max is negative, and Max >= Allocation
  for (let i = 0; i < numProcesses; i++) {
    const p = processes[i];
    for (let j = 0; j < numResources; j++) {
      const alloc = Number(p.allocation[j] || 0);
      const maxVal = Number(p.max[j] || 0);

      if (alloc < 0 || maxVal < 0) {
        return {
          isSafe: false,
          safeSequence: [],
          stepLogs: [],
          needMatrix: [],
          error: `Process ${p.id} has negative resource quantities.`,
        };
      }

      if (maxVal < alloc) {
        return {
          isSafe: false,
          safeSequence: [],
          stepLogs: [],
          needMatrix: [],
          error: `Process ${p.id} has Maximum [${maxVal}] less than Allocation [${alloc}] for resource index ${j}. Maximum must be >= Allocation.`,
        };
      }
    }
  }

  // Calculate Need Matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
  const needMatrix = processes.map((p) => {
    const need = [];
    for (let j = 0; j < numResources; j++) {
      need.push(Number(p.max[j]) - Number(p.allocation[j]));
    }
    return { id: p.id, need };
  });

  // Banker's Algorithm Data Structures
  const work = [...available.map(Number)];
  const finish = new Array(numProcesses).fill(false);
  const safeSequence = [];
  const stepLogs = [];

  let count = 0;
  let madeProgress = true;

  while (count < numProcesses && madeProgress) {
    madeProgress = false;

    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        const p = processes[i];
        const pNeed = needMatrix[i].need;

        // Check if Need[i] <= Work for all resource types
        let canSatisfy = true;
        for (let j = 0; j < numResources; j++) {
          if (pNeed[j] > work[j]) {
            canSatisfy = false;
            break;
          }
        }

        if (canSatisfy) {
          const workBefore = [...work];

          // Reclaim allocated resources: Work = Work + Allocation[i]
          for (let j = 0; j < numResources; j++) {
            work[j] += Number(p.allocation[j]);
          }

          finish[i] = true;
          safeSequence.push(p.id);
          count++;
          madeProgress = true;

          stepLogs.push({
            step: count,
            processId: p.id,
            workBefore,
            need: [...pNeed],
            alloc: [...p.allocation],
            workAfter: [...work],
          });
        }
      }
    }
  }

  const isSafe = count === numProcesses;

  return {
    isSafe,
    safeSequence,
    stepLogs,
    needMatrix,
    error: null,
  };
}
