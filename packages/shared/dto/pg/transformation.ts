import { Vector3 } from '@shared/models/tts-model/Vector3';

export interface TransformationState {
  scale: Vector3;
  rotation: Vector3;
  position: Vector3;
}

export interface Transformation {
  scale?: number[]; // default: Vector3.One
  rotation?: number[]; // default: Vector3.Zero
  position?: number[]; // default: Vector3.Zero
}
