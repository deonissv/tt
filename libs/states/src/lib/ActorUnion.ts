import type { ActorState } from './actor/ActorState';
import type { BagState } from './actor/BagState';
import type { CardState } from './actor/CardState';
import type { DeckState } from './actor/DeckState';
import type {
  Die10State,
  Die12State,
  Die20State,
  Die4State,
  Die6RoundState,
  Die6State,
  Die8State,
} from './actor/DieState';
import type { PawnTokenState } from './actor/PawnTokenState';
import type { TileStackState } from './actor/Stack';
import type { TileState } from './actor/TileState';
import type { ActorType } from './ActorType';

interface ActorStates {
  [ActorType.ACTOR]: ActorState;
  [ActorType.BAG]: BagState;
  [ActorType.CARD]: CardState;
  [ActorType.DECK]: DeckState;
  [ActorType.DIE6ROUND]: Die6RoundState;
  [ActorType.DIE4]: Die4State;
  [ActorType.DIE6]: Die6State;
  [ActorType.DIE8]: Die8State;
  [ActorType.DIE10]: Die10State;
  [ActorType.DIE12]: Die12State;
  [ActorType.DIE20]: Die20State;
  [ActorType.TILE]: TileState;
  [ActorType.TILE_STACK]: TileStackState;
  [ActorType.PAWN_TOKEN]: PawnTokenState;
}

export type ActorMap = {
  [K in ActorType]: ActorStates[K]; // throws if some ActorType mapping to ActorState is missing
};

export type UnknownActorState = ActorMap[ActorType];
