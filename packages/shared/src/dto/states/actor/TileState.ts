import type { ActorBaseState } from './ActorBaseState';
import type { ActorType } from './ActorType';
import type { CustomImage } from './FlatActorState';

export enum TileType {
  BOX,
  HEX,
  CIRCLE,
  ROUNDED,
}

export interface TileState extends ActorBaseState, CustomImage {
  type: ActorType.TILE;

  tileType: TileType;
}
