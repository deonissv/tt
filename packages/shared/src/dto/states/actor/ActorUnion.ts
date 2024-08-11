import type { ActorState } from './ActorState';
import type { ActorType } from './ActorType';
import type { BagState } from './BagState';
import type { CardState } from './CardState';
import type { DeckState } from './DeckState';
import type { Die10State, Die12State, Die20State, Die4State, Die6State, Die8State } from './DieState';
import type { TileStackState } from './Stack';
import type { TileState } from './TileState';

interface ActorStates {
  [ActorType.ACTOR]: ActorState;
  [ActorType.BAG]: BagState;
  [ActorType.CARD]: CardState;
  [ActorType.DECK]: DeckState;
  [ActorType.DIE4]: Die4State;
  [ActorType.DIE6]: Die6State;
  [ActorType.DIE8]: Die8State;
  [ActorType.DIE10]: Die10State;
  [ActorType.DIE12]: Die12State;
  [ActorType.DIE20]: Die20State;
  [ActorType.TILE]: TileState;
  [ActorType.TILE_STACK]: TileStackState;
}

export type ActorMap = {
  [K in ActorType]: ActorStates[K]; // throws if some ActorType mapping to ActorState is missing
};

export type UnknownActorState = ActorMap[ActorType];
