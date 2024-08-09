import type { TileState } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import type { Constructor } from '@shared/types';
import type { SharedBase } from './SharedBase';

interface ITileStack extends SharedBase<TileStackState> {
  size: number;
  pickItem(): Promise<SharedBase<TileState> | null>;
}

export const TileStackMixin = <T extends Constructor<ITileStack>>(Base: T) => {
  return class TileStack extends Base {
    override toState() {
      return {
        ...super.toState(),
        size: this.size,
      };
    }
  };
};
