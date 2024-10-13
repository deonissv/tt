import type { CalculatorState } from './CalculatorState';
import type { ClockSaveState } from './ClockSaveState';
import type { ColourState } from './ColourState';
import type { CounterState } from './CounterState';
import type { CustomAssetState } from './CustomAssetState';
import type { CustomAssetbundleState } from './CustomAssetbundleState';
import type { CustomDeckState } from './CustomDeckState';
import type { CustomImageState } from './CustomImageState';
import type { CustomMeshState } from './CustomMeshState';
import type { DecalState } from './DecalState';
import type { FogOfWarRevealerSaveState } from './FogOfWarRevealerSaveState';
import type { FogOfWarSaveState } from './FogOfWarSaveState';
import type { JointFixedState } from './JointFixedState';
import type { JointHingeState } from './JointHingeState';
import type { Mp3PlayerState } from './Mp3PlayerState';
import type { PhysicsMaterialState } from './PhysicsMaterialState';
import type { RigidbodyState } from './RigidbodyState';
import type { RotationValueState } from './RotationValueState';
import type { SnapPointState } from './SnapPointState';
import type { TabletState } from './TabletState';
import type { TextState } from './TextState';
import type { TransformState } from './TransformState';
import type { VectorLineState } from './VectorLineState';

export interface ObjectState {
  Name: string;
  Transform: TransformState;
  Nickname: string;
  Description: string;
  ColorDiffuse: ColourState;

  /*Toggles*/
  Locked: boolean;
  Grid: boolean;
  Snap: boolean;
  Autoraise: boolean;
  Sticky: boolean;
  Tooltip: boolean;
  GridProjection: boolean;

  /*Nullable to hide object specific properties and save space*/
  HideWhenFaceDown?: boolean; //When face down object is question mark hidden
  Hands?: boolean; //Object will enter player hands
  AltSound?: boolean; //Some objects have 2 materials, with two sound sets
  MaterialIndex?: number; //Some objects can have multiple materials
  MeshIndex?: number; //Some objects can have multiple meshes
  Layer?: number; //Sound Layer
  Number?: number;
  CardID?: number;
  SidewaysCard?: boolean;
  RPGmode?: boolean;
  RPGdead?: boolean;
  FogColor: string;
  FogHidePointers?: boolean;
  FogReverseHiding?: boolean;
  FogSeethrough?: boolean;
  DeckIDs: number[];
  CustomDeck: Record<number, CustomDeckState>;
  CustomMesh: CustomMeshState;
  CustomImage: CustomImageState;
  CustomAssetbundle: CustomAssetbundleState;
  FogOfWar: FogOfWarSaveState;
  FogOfWarRevealer: FogOfWarRevealerSaveState;
  Clock: ClockSaveState;
  Counter: CounterState;
  Tablet: TabletState;
  Mp3Player: Mp3PlayerState;
  Calculator: CalculatorState;
  Text: TextState;
  XmlUI: string;
  CustomUIAssets: CustomAssetState[];
  LuaScript: string;
  LuaScriptState: string; // Serialized running Lua code
  ContainedObjects: ObjectState[]; //Objects inside this one
  PhysicsMaterial: PhysicsMaterialState; //Use to modify the physics material (friction, bounce, etc.) http://docs.unity3d.com/Manual/class-PhysicMaterial.html
  Rigidbody: RigidbodyState; //Use to modify the physical properties (mass, drag, etc) http://docs.unity3d.com/Manual/class-Rigidbody.html
  JointFixed: JointFixedState; //Joints can be used to attached/link objects together check the classes below
  JointHinge: JointHingeState;
  JointSpring: JointHingeState;
  GUID: string; //Used so objects can reference other objects, ex. joints or scripting
  AttachedSnapPoints: SnapPointState[]; //Snap points that are stuck to this object, happens when placing a snap point on a locked object
  AttachedVectorLines: VectorLineState[]; // Vector lines that are stuck to this object, happens when drawing a vector line on a locked object
  AttachedDecals: DecalState[]; //Decals that are attached to this objects
  States: Record<string, ObjectState>; //Objects can have multiple states which can be swapped between
  RotationValues: RotationValueState[]; //Rotation values are tooltip values tied to rotations
  ChildObjects: ObjectState[];
}
