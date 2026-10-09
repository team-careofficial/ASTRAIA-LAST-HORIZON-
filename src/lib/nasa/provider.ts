export interface MarsSnapshot {
  source: "mock" | "nasa";
  label: string;
  avgSurfaceTempC: number; surfacePressurePa: number; gravityMs2: number; solDurationHours: number;
}
export interface MarsDataProvider { getSnapshot(): Promise<MarsSnapshot> }

/** Static approximate reference values. NOT a live NASA feed. */
export class MockMarsDataProvider implements MarsDataProvider {
  async getSnapshot(): Promise<MarsSnapshot> {
    return { source: "mock", label: "Approximate reference values (offline fallback, not live NASA data)",
      avgSurfaceTempC: -63, surfacePressurePa: 610, gravityMs2: 3.71, solDurationHours: 24.66 };
  }
}
// Phase 2: implement NasaMarsDataProvider here (e.g. InSight weather or Mars Rover Photos via NASA Open APIs).
// Call it from a server route so the API key stays private, and set source: "nasa" only for real responses.
export const getMarsDataProvider = (): MarsDataProvider => new MockMarsDataProvider();
