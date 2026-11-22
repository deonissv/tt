import { z } from 'zod';
import { BagStateSchema } from './BagState';
import { CalculatorStateSchema } from './CalculatorState';
import { ClockSaveStateSchema } from './ClockSaveState';
import { ColourStateSchema } from './ColourState';
import { CounterStateSchema } from './CounterState';
import { CustomAssetStateSchema } from './CustomAssetState';
import { CustomAssetbundleStateSchema } from './CustomAssetbundleState';
import { CustomDeckStateSchema } from './CustomDeckState';
import { CustomFigurineStateSchema } from './CustomFigurineState';
import { CustomImageStateSchema } from './CustomImageState';
import { CustomMeshStateSchema } from './CustomMeshState';
import { CustomPDFStateSchema } from './CustomPDFState';
import { DecalStateSchema } from './DecalState';
import { FogOfWarRevealerSaveStateSchema } from './FogOfWarRevealerSaveState';
import { FogOfWarSaveStateSchema } from './FogOfWarSaveState';
import { JointStateSchema } from './JointState';
import { JointHingeStateSchema } from './JointHingeState';
import { JointSpringStateSchema } from './JointSpringState';
import { LayoutZoneStateSchema } from './LayoutZoneState';
import { Mp3PlayerStateSchema } from './Mp3PlayerState';
import { PhysicsMaterialStateSchema } from './PhysicsMaterialState';
import { RigidbodyStateSchema } from './RigidbodyState';
import { RotationValueStateSchema } from './RotationValueState';
import { SnapPointStateSchema } from './SnapPointState';
import { TabletStateSchema } from './TabletState';
import { TextStateSchema } from './TextState';
import { TransformStateSchema } from './TransformState';
import { Vector3Schema } from './Vector3';
import { VectorLineStateSchema } from './VectorLineState';

/**
 * One object on the table. Field names and nullability match the game's `ObjectState` DTO
 * in Assembly-CSharp.dll, MVID 30865bee-f32b-4e16-b425-3a2b235d4eaf.
 *
 * The game always writes `GUID`, `Name`, `Transform` and the toggles. It omits blocks that
 * do not apply to the object. Unset nullable fields appear as explicit nulls, such as
 * `RPGmode: null`. Keep those nulls when parsing and exporting.
 *
 * Omit `StateComparer`, an `IEqualityComparer<KeyValuePair<int, ObjectState>>`.
 * The game uses it at runtime but never writes it to a save.
 */
export const ObjectStateSchema = z
  .object({
    GUID: z.string(), // Object ID used by joints and scripts to reference this object
    Name: z.string(), // Internal type name, e.g. "Card", "DeckCustom", "Custom_Model"
    Transform: TransformStateSchema,
    Nickname: z.string(),
    Description: z.string(),
    GMNotes: z.string(), // Hidden notes only visible to the GM
    AltLookAngle: Vector3Schema, // Secondary look-at angle used by alt-zoom

    /** Diffuse tint; omitted when the object uses its material colour. */
    ColorDiffuse: ColourStateSchema.nullable().optional(),
    Memo: z.string().optional(), // Memo notebook text bound to the object
    Tags: z.array(z.string()).nullable().optional(), // Component tags for search and filtering
    LayoutGroupSortIndex: z.number(), // Sort order inside a layout zone
    Value: z.number(), // Face value for chips, dice, etc.
    Locked: z.boolean(),
    Grid: z.boolean(),
    Snap: z.boolean(),
    IgnoreFoW: z.boolean(), // Object ignores fog of war
    MeasureMovement: z.boolean(),
    DragSelectable: z.boolean(),
    Autoraise: z.boolean(),
    Sticky: z.boolean(),
    Tooltip: z.boolean(),
    GridProjection: z.boolean(),

    // The game uses null for unset object-specific properties.
    HideWhenFaceDown: z.boolean().nullable().optional(), // Hide the face-down object with a question mark
    Hands: z.boolean().nullable().optional(), // Object will enter player hands
    AltZoomable: z.boolean().nullable().optional(), // Alt-zoom shows the object instead of magnifying it
    AltSound: z.boolean().nullable().optional(), // Some objects have 2 materials, with two sound sets
    MaterialIndex: z.number().nullable().optional(), // Material selection. 0 = Plastic, 1 = Wood, 2 = Metal, 3 = Cardboard
    MeshIndex: z.number().nullable().optional(), // Mesh selection for objects with multiple meshes
    Number: z.number().nullable().optional(), // Stack count for tiles, tokens, figurines and dice groups
    RPGmode: z.boolean().nullable().optional(), // RPG figurine hit-point mode
    RPGdead: z.boolean().nullable().optional(), // RPG figurine is dead
    FogColor: z.string().optional(), // Player colour this fog-of-war zone hides for, such as "White" or "Red"
    FogHidePointers: z.boolean().nullable().optional(),
    FogReverseHiding: z.boolean().nullable().optional(),
    FogSeethrough: z.boolean().nullable().optional(),
    miscID: z.string().optional(), // Internal catalog id for built-in objects
    vector: Vector3Schema.nullable().optional(), // Scripting/vector helper value stored per object
    CardID: z.number().nullable().optional(), // Card index inside the deck: <deck id><2-digit sequence>
    SidewaysCard: z.boolean().nullable().optional(),

    DeckIDs: z.array(z.number()).optional(), // Card IDs inside this deck, bottom to top
    CustomDeck: z.record(z.string(), CustomDeckStateSchema).optional(), // Keyed by the numeric deck id
    CustomMesh: CustomMeshStateSchema.optional(),
    CustomImage: CustomImageStateSchema.optional(),
    CustomAssetbundle: CustomAssetbundleStateSchema.optional(),
    CustomPDF: CustomPDFStateSchema.optional(),
    CustomFigurine: CustomFigurineStateSchema.optional(),
    FogOfWar: FogOfWarSaveStateSchema.optional(),
    FogOfWarRevealer: FogOfWarRevealerSaveStateSchema.optional(),
    LayoutZone: LayoutZoneStateSchema.optional(),
    Clock: ClockSaveStateSchema.optional(),
    Counter: CounterStateSchema.optional(),
    Tablet: TabletStateSchema.optional(),
    Mp3Player: Mp3PlayerStateSchema.optional(), // Music player state attached to the object
    Calculator: CalculatorStateSchema.optional(),
    Text: TextStateSchema.optional(), // 3D text label
    Bag: BagStateSchema.optional(),

    LuaScript: z.string().optional(),
    LuaScriptState: z.string().optional(), // Serialized running Lua code
    XmlUI: z.string(), // Object XML UI
    CustomUIAssets: z.array(CustomAssetStateSchema).nullable().optional(), // Assets referenced by XmlUI

    PhysicsMaterial: PhysicsMaterialStateSchema.optional(), // Friction, bounce, etc. http://docs.unity3d.com/Manual/class-PhysicMaterial.html
    Rigidbody: RigidbodyStateSchema.optional(), // Mass, drag, etc. http://docs.unity3d.com/Manual/class-Rigidbody.html
    JointFixed: JointStateSchema.optional(), // Joints link objects together, check the joint classes
    JointHinge: JointHingeStateSchema.optional(),
    JointSpring: JointSpringStateSchema.optional(),

    get ContainedObjects() {
      return z.array(ObjectStateSchema).optional();
    }, // Objects inside this bag or deck
    AttachedSnapPoints: z.array(SnapPointStateSchema).optional(), // Snap points stuck to this object
    AttachedVectorLines: z.array(VectorLineStateSchema).optional(), // Vector lines stuck to this object
    AttachedDecals: z.array(DecalStateSchema).optional(), // Decals attached to this object
    /** Object variants keyed by state index, such as "0" or "1". */
    get States() {
      return z.record(z.string(), ObjectStateSchema).optional();
    },
    RotationValues: z.array(RotationValueStateSchema).optional(), // Tooltip values tied to rotations
    get ChildObjects() {
      return z.array(ObjectStateSchema).optional();
    }, // Child objects, such as tokens attached to boards
  })
  .meta({ id: 'ObjectState', title: 'ObjectState' });

export type ObjectState = z.infer<typeof ObjectStateSchema>;

/** The game's `JointFixed` DTO is structurally identical to `JointState`. */
export type JointFixedState = z.infer<typeof JointStateSchema>;
