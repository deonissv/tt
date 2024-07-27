import type { ActorState } from './ActorState';
import type { BagState } from './BagState';
import type { CardState } from './CardState';
import type { DeckState } from './DeckState';
import type { Die10State, Die12State, Die20State, Die4State, Die6State, Die8State } from './DieState';
import type { TableState } from './TableState';
import type { TileState } from './TileState';

export type ActorUnion =
  | ActorState
  | BagState
  | CardState
  | DeckState
  | Die4State
  | Die6State
  | Die8State
  | Die10State
  | Die12State
  | Die20State
  | TableState
  | TileState;
