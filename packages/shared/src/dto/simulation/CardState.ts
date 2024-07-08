import { ActorStateBase } from './ActorStateBase';

export interface CardGrid {
  rows: number;
  cols: number;
  sequence: number;
}

export class CardState extends ActorStateBase {
  faceURL: string;
  backURL: string;
  grid?: CardGrid;

  static override validate(state: ActorStateBase): state is CardState {
    const cardState = state as CardState;
    return cardState.faceURL !== undefined && cardState.backURL !== undefined;
  }
}
