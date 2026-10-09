export const START: [number, number][] = [[-2, 5], [2, 5], [-1, 8], [3, 8]];
export const ARENA_RADIUS = 42;
export const ROVER_HOME: [number, number] = [6, 9];
export const ROVER_STRANDED: [number, number] = [24, 20];
export const STATIONS = [{ id: "science", pos: [-13, 4] as [number, number], color: "#7aa0c8" }, { id: "medical", pos: [3, -7] as [number, number], color: "#b9c46a" }];
export const SENSOR: [number, number] = [-24, -18];
/** Circle colliders (x, z, r). Rover moves in mission 5. */
export const colliders = (mission: number) => [
  { x: -10, z: -8, r: 3 }, { x: 14, z: 0, r: 5 }, { x: 0, z: -15, r: 1 }, { x: 9, z: -8, r: 1.2 }, { x: -13, z: 4, r: 1.1 }, { x: 3, z: -7, r: 1.1 },
  mission === 5 ? { x: ROVER_STRANDED[0], z: ROVER_STRANDED[1], r: 2.2 } : { x: ROVER_HOME[0], z: ROVER_HOME[1], r: 2.2 },
];
