import type { ActorStateBase } from './ActorStateBase';

export interface CardState extends ActorStateBase {
  faceURL: string;
  backURL: string;
  grid?: {
    rows: number;
    cols: number;
    row: number;
    col: number;
  };
}
