import { z } from 'zod';
import { CameraStateSchema } from './CameraState';
import { CustomAssetStateSchema } from './CustomAssetState';
import { CustomDecalStateSchema } from './CustomDecalState';
import { DecalStateSchema } from './DecalState';
import { GridStateSchema } from './GridState';
import { HandsStateSchema } from './HandsState';
import { LightingStateSchema } from './LightingState';
import { MusicPlayerStateSchema } from './MusicPlayerState';
import { ObjectStateSchema } from './ObjectState';
import { SnapPointStateSchema } from './SnapPointState';
import { TabStateSchema } from './TabState';
import { TagsStateSchema } from './TagsState';
import { TurnsStateSchema } from './TurnsState';
import { VectorLineStateSchema } from './VectorLineState';
import { urlString } from './url';

/**
 * Schema for `TS_Save_*.json`, `TS_AutoSave*.json`, workshop mods and saved objects.
 *
 * Field names and nullability match the game's `SaveState` DTO in Assembly-CSharp.dll,
 * MVID 30865bee-f32b-4e16-b425-3a2b235d4eaf, SHA-256 e0db7d23…60b8cd7.
 * Only `SaveName` and `ObjectStates` are required. Saved objects and older saves omit
 * other fields. The game writes unset nullable fields as explicit nulls, including
 * `EpochTime` and `PlayingTime`.
 */
export const SaveStateSchema = z
  .object({
    SaveName: z.string(),
    /** Unix seconds when the save was written; null when the game did not record it. */
    EpochTime: z.number().nullable().optional(),
    Date: z.string().optional(),
    VersionNumber: z.string().optional(), // e.g. "v13.3"
    GameMode: z.string().optional(),
    GameType: z.string().optional(),
    GameComplexity: z.string().optional(),
    PlayingTime: z.array(z.number()).nullable().optional(),
    PlayerCounts: z.array(z.number()).nullable().optional(),
    Tags: z.array(z.string()).nullable().optional(), // Workshop tags
    /** Gravity multiplier; 1 is Earth gravity. */
    Gravity: z.number().optional(),
    PlayArea: z.number().optional(),
    Table: z.string().optional(), // Built-in table name, e.g. "Table_Custom"
    TableURL: urlString().optional(), // For custom tables
    Sky: z.string().optional(),
    SkyURL: urlString().optional(), // For custom sky
    Note: z.string().optional(), // GM notes
    Rules: z.string().optional(),
    /** Notepad tabs keyed by index, such as "0" or "1". */
    TabStates: z.record(z.string(), TabStateSchema).nullable().optional(),
    MusicPlayer: MusicPlayerStateSchema.nullable().optional(), // Save-wide music player state
    Grid: GridStateSchema.nullable().optional(), // Grid menu settings
    Lighting: LightingStateSchema.nullable().optional(), // Lighting menu settings
    Hands: HandsStateSchema.nullable().optional(), // Hand menu settings and hand positions
    ComponentTags: TagsStateSchema.nullable().optional(), // Component tag labels known to this save
    Turns: TurnsStateSchema.nullable().optional(), // Turn menu settings
    /** Saved camera positions per colour; entries are null where no camera was saved. */
    CameraStates: z.array(CameraStateSchema.nullable()).optional(),
    DecalPallet: z.array(CustomDecalStateSchema).optional(), // Decals that can be placed in the world
    LuaScript: z.string().optional(), // Global script
    LuaScriptState: z.string().optional(), // Serialized running Lua code
    XmlUI: z.string().optional(), // Global XML UI
    CustomUIAssets: z.array(CustomAssetStateSchema).optional(), // Assets referenced by XmlUI
    Decals: z.array(DecalStateSchema).optional(), // Decals not attached to objects
    VectorLines: z.array(VectorLineStateSchema).optional(), // Vector lines on canvas 0, on and beyond the table
    SnapPoints: z.array(SnapPointStateSchema).optional(), // Snap points not attached to objects
    ObjectStates: z.array(ObjectStateSchema), // Objects on the table
  })
  .meta({ id: 'SaveState', title: 'SaveState' });

export type SaveState = z.infer<typeof SaveStateSchema>;
