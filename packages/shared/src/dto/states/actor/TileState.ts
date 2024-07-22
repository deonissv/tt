import type { ActorStateBase } from './ActorStateBase';
import type { ActorType } from './ActorType';

export enum TileType {
  BOX,
  HEX,
  CIRCLE,
  ROUNDED,
}

export interface TileState extends ActorStateBase {
  type: ActorType.TILE;

  tileType: TileType;
  faceURL: string;
  backURL?: string;
}
