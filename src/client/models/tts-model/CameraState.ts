import { Vector3 } from "./Vector3";

export interface CameraState {
    Position: Vector3;
    Rotation: Vector3;
    Distance: number;
    Zoomed: boolean;
}
