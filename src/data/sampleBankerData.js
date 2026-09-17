export const DEFAULT_BANKER_DATA = {
  resourceNames: ["A", "B", "C"],
  available: [3, 3, 2],
  processes: [
    { id: "P0", allocation: [0, 1, 0], max: [7, 5, 3] },
    { id: "P1", allocation: [2, 0, 0], max: [3, 2, 2] },
    { id: "P2", allocation: [3, 0, 2], max: [9, 0, 2] },
    { id: "P3", allocation: [2, 1, 1], max: [2, 2, 2] },
    { id: "P4", allocation: [0, 0, 2], max: [4, 3, 3] },
  ],
};

export const UNSAFE_BANKER_DATA = {
  resourceNames: ["A", "B", "C"],
  available: [0, 0, 0],
  processes: [
    { id: "P0", allocation: [1, 2, 1], max: [3, 4, 3] },
    { id: "P1", allocation: [2, 0, 1], max: [4, 2, 2] },
    { id: "P2", allocation: [2, 2, 1], max: [5, 3, 3] },
  ],
};
