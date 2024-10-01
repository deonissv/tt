import type { TileState } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import type { SharedBase } from './SharedBase';

export const TileMixin = <T extends Constructor<SharedBase<TileState>>>(Base: T) => {
  return class Tile extends Base {};
};
