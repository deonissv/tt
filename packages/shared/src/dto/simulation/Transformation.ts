export interface TransformationState {
  scale: number[];
  rotation: number[];
  position: number[];
}

export interface Transformation {
  scale?: number[]; // default: Vector3.One
  rotation?: number[]; // default: Vector3.Zero
  position?: number[]; // default: Vector3.Zero
}
