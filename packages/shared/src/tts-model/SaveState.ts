import type { CameraState } from './CameraState';
import type { CustomAssetState } from './CustomAssetState';
import type { CustomDecalState } from './CustomDecalState';
import type { DecalState } from './DecalState';
import type { GridState } from './GridState';
import type { HandsState } from './HandsState';
import type { LightingState } from './LightingState';
import type { ObjectState } from './ObjectState';
import type { SnapPointState } from './SnapPointState';
import type { TabState } from './TabState';
import type { TurnsState } from './TurnsState';
import type { VectorLineState } from './VectorLineState';

export interface SaveState {
  SaveName: string;
  GameMode: string;
  Gravity: number;
  PlayArea: number;
  Date: string;
  Table: string;
  TableURL: string; // For custom tables
  Sky: string;
  SkyURL: string; // For custom sky
  Note: string;
  Rules: string;
  XmlUI: string; // Custom Xml UI
  CustomUIAssets: CustomAssetState[];
  LuaScript: string;
  LuaScriptState: string; // Serialized running Lua code
  Grid: GridState; // Grid menu settings
  Lighting: LightingState; //Lighting menu settings
  Hands: HandsState; // Hand menu settings and hand positions
  Turns: TurnsState; // Turn menu settings
  VectorLines: VectorLineState; // Vector lines on canvas 0 (table + beyond)
  ObjectStates: ObjectState[]; // Objects on the table
  SnapPoints: SnapPointState[]; // Snap points not attached to objects
  DecalPallet: CustomDecalState[]; // Decals that can be placed in the world
  Decals: DecalState[]; // Decals not attached to objects
  TabStates: TabState[]; // Dictionary<int, TabState>  = new Dictionary<int, TabState>(); //Notepad tabs
  CameraStates: CameraState[]; // Saved camera positions
  VersionNumber: string;
}

// export const SaveStateDefault: SaveState = {
//     SaveName: "",
//     GameMode: "",
//     Gravity: 0.5,
//     PlayArea: 0.5,
//     Date: "",
//     Table: "",
//     TableURL: "",
//     Sky: "",
//     SkyURL: "",
//     Note: "",
//     Rules: "",
//     XmlUI: "",
//     CustomUIAssets: [],
//     LuaScript: "",
//     LuaScriptState: "",
//     Grid: GridStateDefaults,
//     Lighting: LightingStateDefault,
//     Hands: HandStateDefault,
//     Turns: TurnsStateDefault,
//     VectorLines: VectorLineStateDefault,
//     ObjectStates: [],
//     SnapPoints: [],
//     DecalPallet: [],
//     Decals: [],
//     TabStates: [],
//     CameraStates: [],
//     VersionNumber: ""
// }
