export interface FogOfWarSaveState {
  HideGmPointer: boolean;
  HideObjects: boolean;
  Height: number;
  RevealedLocations: Record<string, number[]>; // public Dictionary<string, HashSet<int>> RevealedLocations;
}
