import type { Vector3 } from './Vector3';

export interface SnapPointState {
  Position: Vector3; //World position when not attached and local position when attached to an object
  Rotation: Vector3; //Rotate is only set for rotation snap points
}
