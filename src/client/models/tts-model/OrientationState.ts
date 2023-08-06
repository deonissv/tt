import { Quaternion } from "./Quaternion";
import { Vector3 } from "./Vector3";

export interface OrientationState {
    Position: Vector3;
    Rotation: Quaternion;
}
