import type { ActorStateBase } from './ActorStateBase';
import type { ActorType } from './ActorType';
import type { CustomImage } from './FlatActorState';
import type { TileType } from './TileState';

export interface StackBaseState extends ActorStateBase, CustomImage {
  size: number;
}

export interface TileStackState extends StackBaseState {
  type: ActorType.TILE_STACK;
  tileType: TileType;
}
