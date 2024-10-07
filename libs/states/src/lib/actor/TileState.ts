import type { ActorBaseState } from '../ActorBaseState';
import type { ActorType } from '../ActorType';
import type { TileType } from '../variants';
import type { CustomImage } from './FlatActorState';

export interface TileState extends ActorBaseState, CustomImage {
  type: ActorType.TILE;

  tileType: TileType;
}
