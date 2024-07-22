import type { ActorStateBase } from './ActorStateBase';
import type { ActorType } from './ActorType';
import type { CardState } from './CardState';

export interface DeckState extends ActorStateBase {
  type: ActorType.DECK;
  cards: CardState[];
}
