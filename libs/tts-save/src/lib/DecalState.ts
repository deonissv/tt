import type { CustomDecalState } from './CustomDecalState';
import type { TransformState } from './TransformState';

export interface DecalState {
  Transform: TransformState;
  CustomDecal: CustomDecalState;
}
