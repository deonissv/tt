import type { Mesh } from '@babylonjs/core';
import type { TileState } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import type { Constructor } from '@shared/types';
import type { Containable } from '../actions/Containable';
import type { SharedBase } from './SharedBase';

export const TileStackMixin = (Base: Constructor<SharedBase<TileStackState>>) => {
  return class TileStack extends Base implements Containable {
    size: number;

    constructor(state: TileStackState, model: Mesh) {
      super(state, model);

      this.size = state.size;
      model.scaling.y = this.size;
    }

    override toState() {
      return {
        ...super.toState(),
        size: this.size,
      };
    }

    pickItem(): Promise<SharedBase<TileState> | null> {
      throw new Error('Not implemented');
    }
  };
};
