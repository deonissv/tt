import type { Tuple } from '@babylonjs/core/types';

export interface Transformation {
  scale?: Tuple<number, 3>; // default: Vector3.One
  rotation?: Tuple<number, 3>; // default: Vector3.Zero
  position?: Tuple<number, 3>; // default: Vector3.Zero
}
