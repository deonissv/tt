import type { TileStackState } from '@shared/dto/states/actor/Stack';
import type { Constructor } from '@shared/types';
import type { SharedBase } from './SharedBase';

export const TileStackMixin = <T extends Constructor<SharedBase<TileStackState>>>(Base: T) => {
  return class TileStack extends Base {
    size: number;

    override toState() {
      return {
        ...super.toState(),
        size: this.size,
      };
    }
  };
};
