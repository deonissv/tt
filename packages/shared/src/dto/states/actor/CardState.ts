import type { ActorStateBase } from './ActorStateBase';
import type { ActorType } from './ActorType';

export interface CardGrid {
  faceURL: string;
  backURL: string;

  rows: number;
  cols: number;
  sequence: number;
}

export interface CardState extends ActorStateBase, CardGrid {
  type: ActorType.CARD;
}
