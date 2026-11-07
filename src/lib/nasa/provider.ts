export interface MarsSnapshot {
  source: "mock" | "nasa";
  label: string;
  avgSurfaceTempC: number; surfacePressurePa: number; gravityMs2: number; solDurationHours: number;
}
export interface MarsDataProvider { getSnapshot(): Promise<MarsSnapshot> }

/** A saved copy of values from the NASA NSSDC Mars Fact Sheet (page updated 19 May 2025). NOT a live NASA feed. */
export class MockMarsDataProvider implements MarsDataProvider {
  async getSnapshot(): Promise<MarsSnapshot> {
    return { source: "mock", label: "Snapshot of NASA Mars Fact Sheet (19 May 2025), not a live feed",
      avgSurfaceTempC: -59, surfacePressurePa: 636, gravityMs2: 3.73, solDurationHours: 24.66 };
  }
}
// Phase 2: implement NasaMarsDataProvider here (e.g. InSight weather or Mars Rover Photos via NASA Open APIs).
// Call it from a server route so the API key stays private, and set source: "nasa" only for real responses.
export const getMarsDataProvider = (): MarsDataProvider => new MockMarsDataProvider();
