import type { TileState } from '@tt/states';
import { Constructor } from '@tt/utils';
import type { SharedBase } from './SharedBase';

export const TileMixin = <T extends Constructor<SharedBase<TileState>>>(Base: T) => {
  return class Tile extends Base {};
};
