import { CalculatorState } from './CalculatorState';
import { ClockSaveState } from './ClockSaveState';
import { ColourState } from './ColourState';
import { CounterState } from './CounterState';
import { CustomAssetState } from './CustomAssetState';
import { CustomAssetbundleState } from './CustomAssetbundleState';
import { CustomDeckState } from './CustomDeckState';
import { CustomImageState } from './CustomImageState';
import { CustomMeshState } from './CustomMeshState';
import { DecalState } from './DecalState';
import { FogOfWarRevealerSaveState } from './FogOfWarRevealerSaveState';
import { FogOfWarSaveState } from './FogOfWarSaveState';
import { JointFixedState } from './JointFixedState';
import { JointHingeState } from './JointHingeState';
import { Mp3PlayerState } from './Mp3PlayerState';
import { PhysicsMaterialState } from './PhysicsMaterialState';
import { RigidbodyState } from './RigidbodyState';
import { RotationValueState } from './RotationValueState';
import { SnapPointState } from './SnapPointState';
import { TabletState } from './TabletState';
import { TextState } from './TextState';
import { TransformState } from './TransformState';
import { VectorLineState } from './VectorLineState';

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
  CustomDeck: { [key: number]: CustomDeckState };
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
  ContainedObjects: ObjectState; //Objects inside this one
  PhysicsMaterial: PhysicsMaterialState; //Use to modify the physics material (friction, bounce, etc.) http://docs.unity3d.com/Manual/class-PhysicMaterial.html
  Rigidbody: RigidbodyState; //Use to modify the physical properties (mass, drag, etc) http://docs.unity3d.com/Manual/class-Rigidbody.html
  JointFixed: JointFixedState; //Joints can be used to attached/link objects together check the classes below
  JointHinge: JointHingeState;
  JointSpring: JointHingeState;
  GUID: string; //Used so objects can reference other objects, ex. joints or scripting
  AttachedSnapPoints: SnapPointState[]; //Snap points that are stuck to this object, happens when placing a snap point on a locked object
  AttachedVectorLines: VectorLineState[]; // Vector lines that are stuck to this object, happens when drawing a vector line on a locked object
  AttachedDecals: DecalState[]; //Decals that are attached to this objects
  States: { [key: number]: ObjectState }; //Objects can have multiple states which can be swapped between
  RotationValues: RotationValueState[]; //Rotation values are tooltip values tied to rotations
}
