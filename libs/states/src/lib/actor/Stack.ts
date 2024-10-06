import type { ActorBaseState } from '../ActorBaseState';
import type { ActorType } from '../ActorType';
import { TileType } from '../variants';
import type { CustomImage } from './FlatActorState';

export interface StackBaseState extends ActorBaseState, CustomImage {
  size: number;
}

export interface TileStackState extends StackBaseState {
  type: ActorType.TILE_STACK;
  tileType: TileType;
}
