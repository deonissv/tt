import { ActorStateBase } from './ActorStateBase';

export interface DeckGrid {
  faceURL: string;
  backURL: string;
  rows: number;
  cols: number;
}

export interface DeckCard {
  cardGUID: string;
  deckId: number;
  sequence: number;
}

export class DeckState extends ActorStateBase {
  cards: DeckCard[];
  grids: Record<number, DeckGrid>;

  static override validate(state: ActorStateBase): state is DeckState {
    return (state as DeckState).cards !== undefined;
  }
}
