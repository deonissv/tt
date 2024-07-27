import type { ActorBaseState } from './ActorBaseState';
import type { ActorType } from './ActorType';
import type { CardState } from './CardState';

export interface DeckState extends ActorBaseState {
  type: ActorType.DECK;
  cards: CardState[];
}
