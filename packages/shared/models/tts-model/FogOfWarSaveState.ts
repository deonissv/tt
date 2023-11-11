export interface FogOfWarSaveState {
  HideGmPointer: boolean;
  HideObjects: boolean;
  Height: number;
  RevealedLocations: { [key: string]: number[] }; // public Dictionary<string, HashSet<int>> RevealedLocations;
}
