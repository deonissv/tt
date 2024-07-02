import type { Quaternion } from './Quaternion';
import type { Vector3 } from './Vector3';

export interface OrientationState {
  Position: Vector3;
  Rotation: Quaternion;
}
