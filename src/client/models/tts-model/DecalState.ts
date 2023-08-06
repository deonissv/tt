import { CustomDecalState } from "./CustomDecalState";
import { TransformState } from "./TransformState";

export interface DecalState {
    Transform: TransformState;
    CustomDecal: CustomDecalState;
}