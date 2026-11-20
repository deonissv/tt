import type { ActorBaseState } from '../ActorBaseState';
import type { ActorType } from '../ActorType';

export interface CardGrid {
  faceURL: string;
  backURL: string;

  rows: number;
  cols: number;
  sequence: number;
  /** Public geometry, independent of the private face image and atlas coordinates. */
  faceAspectRatio?: number;
}

export interface CardState extends ActorBaseState, CardGrid {
  type: ActorType.CARD;
}
