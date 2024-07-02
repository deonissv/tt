import type { ActorStateBase } from './ActorStateBase';

export interface DeckGrid {
  faceURL: string;
  backURL: string;
  rows: number;
  cols: number;
}

export interface DeckState extends ActorStateBase {
  cards: Record<string, string>;
  grids: Record<number, DeckGrid>;
}
