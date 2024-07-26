import type { ActorStateBase } from './ActorStateBase';
import type { ActorType } from './ActorType';
import type { CustomImage } from './FlatActorState';

export enum TileType {
  BOX,
  HEX,
  CIRCLE,
  ROUNDED,
}

export interface TileState extends ActorStateBase, CustomImage {
  type: ActorType.TILE;

  tileType: TileType;
}
