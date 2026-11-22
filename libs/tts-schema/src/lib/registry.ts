import { BagStateSchema } from './BagState';
import { CalculatorStateSchema } from './CalculatorState';
import { CameraStateSchema } from './CameraState';
import { ClockSaveStateSchema } from './ClockSaveState';
import { ColourStateSchema } from './ColourState';
import { CounterStateSchema } from './CounterState';
import { CustomAssetStateSchema } from './CustomAssetState';
import { CustomAssetbundleStateSchema } from './CustomAssetbundleState';
import { CustomDecalStateSchema } from './CustomDecalState';
import { CustomDeckStateSchema } from './CustomDeckState';
import { CustomFigurineStateSchema } from './CustomFigurineState';
import {
  CustomDiceStateSchema,
  CustomImageStateSchema,
  CustomJigsawPuzzleStateSchema,
  CustomTileStateSchema,
  CustomTokenStateSchema,
} from './CustomImageState';
import { CustomMeshStateSchema } from './CustomMeshState';
import { CustomPDFStateSchema } from './CustomPDFState';
import { CustomShaderStateSchema } from './CustomShaderState';
import { DecalStateSchema } from './DecalState';
import { FogOfWarRevealerSaveStateSchema } from './FogOfWarRevealerSaveState';
import { FogOfWarSaveStateSchema } from './FogOfWarSaveState';
import { GridStateSchema } from './GridState';
import { HandTransformStateSchema, HandsStateSchema } from './HandsState';
import { JointLimitsSchema, JointMotorSchema, JointSpringSchema, JointHingeStateSchema } from './JointHingeState';
import { JointStateSchema } from './JointState';
import { JointSpringStateSchema } from './JointSpringState';
import { LayoutZoneOptionsSchema } from './LayoutZoneOptions';
import { LayoutZoneStateSchema } from './LayoutZoneState';
import { LightingStateSchema } from './LightingState';
import { Mp3PlayerStateSchema } from './Mp3PlayerState';
import { AudioLibraryEntrySchema, MusicPlayerStateSchema } from './MusicPlayerState';
import { ObjectStateSchema } from './ObjectState';
import { PhysicsMaterialStateSchema } from './PhysicsMaterialState';
import { RigidbodyStateSchema } from './RigidbodyState';
import { RotationValueStateSchema } from './RotationValueState';
import { SaveStateSchema } from './SaveState';
import { SnapPointStateSchema } from './SnapPointState';
import { TabStateSchema } from './TabState';
import { TagLabelStateSchema, TagsStateSchema } from './TagsState';
import { TabletStateSchema } from './TabletState';
import { TextStateSchema } from './TextState';
import { TransformStateSchema } from './TransformState';
import { TurnsStateSchema } from './TurnsState';
import { Vector3Schema } from './Vector3';
import { VectorLineStateSchema } from './VectorLineState';

/**
 * DTO schemas keyed by their names in the game's assembly.
 * @tt/tts-parser uses these schemas for validation and asset collection.
 * JSON Schema generation also uses these definitions.
 */
export const DTO_SCHEMAS = {
  SaveState: SaveStateSchema,
  ObjectState: ObjectStateSchema,
  TransformState: TransformStateSchema,
  Vector3: Vector3Schema,
  ColourState: ColourStateSchema,
  TabState: TabStateSchema,
  MusicPlayerState: MusicPlayerStateSchema,
  AudioLibraryEntry: AudioLibraryEntrySchema,
  GridState: GridStateSchema,
  LightingState: LightingStateSchema,
  HandsState: HandsStateSchema,
  HandTransformState: HandTransformStateSchema,
  TurnsState: TurnsStateSchema,
  CameraState: CameraStateSchema,
  CustomDecalState: CustomDecalStateSchema,
  CustomAssetState: CustomAssetStateSchema,
  DecalState: DecalStateSchema,
  VectorLineState: VectorLineStateSchema,
  SnapPointState: SnapPointStateSchema,
  CustomDeckState: CustomDeckStateSchema,
  CustomMeshState: CustomMeshStateSchema,
  CustomShaderState: CustomShaderStateSchema,
  CustomImageState: CustomImageStateSchema,
  CustomDiceState: CustomDiceStateSchema,
  CustomTokenState: CustomTokenStateSchema,
  CustomJigsawPuzzleState: CustomJigsawPuzzleStateSchema,
  CustomTileState: CustomTileStateSchema,
  CustomAssetbundleState: CustomAssetbundleStateSchema,
  CustomPDFState: CustomPDFStateSchema,
  CustomFigurineState: CustomFigurineStateSchema,
  FogOfWarSaveState: FogOfWarSaveStateSchema,
  FogOfWarRevealerSaveState: FogOfWarRevealerSaveStateSchema,
  LayoutZoneState: LayoutZoneStateSchema,
  LayoutZoneOptions: LayoutZoneOptionsSchema,
  ClockSaveState: ClockSaveStateSchema,
  CounterState: CounterStateSchema,
  TabletState: TabletStateSchema,
  BagState: BagStateSchema,
  Mp3PlayerState: Mp3PlayerStateSchema,
  CalculatorState: CalculatorStateSchema,
  TextState: TextStateSchema,
  PhysicsMaterialState: PhysicsMaterialStateSchema,
  RigidbodyState: RigidbodyStateSchema,
  JointState: JointStateSchema,
  JointHingeState: JointHingeStateSchema,
  JointLimits: JointLimitsSchema,
  JointMotor: JointMotorSchema,
  JointSpring: JointSpringSchema,
  JointSpringState: JointSpringStateSchema,
  RotationValueState: RotationValueStateSchema,
  TagsState: TagsStateSchema,
  TagLabelState: TagLabelStateSchema,
};

export type DtoName = keyof typeof DTO_SCHEMAS;
