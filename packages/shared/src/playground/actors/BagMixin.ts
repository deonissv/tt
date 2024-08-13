import { STATIC_HOST } from '@shared/constants';
import type { BagState, Model } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import type { Constructor } from '@shared/types';
import { Loader } from '../Loader';
import type { SharedBase } from './SharedBase';

const BAG_MODEL: Model = {
  meshURL: `${STATIC_HOST}/Group1.obj`,
  normalURL: `${STATIC_HOST}/bag_N.png`,
  specularURL: `${STATIC_HOST}/bag_S.png`,
  diffuseURL: `${STATIC_HOST}/2-bag_D_gray.png`,
};

export const BagMixin = <T extends Constructor<SharedBase<BagState>>>(Base: T) => {
  return class Bag extends Base {
    items: UnknownActorState[];

    get size() {
      return this.items.length;
    }

    static async fromState<T extends Bag>(this: Constructor<T>, state: BagState): Promise<T | null> {
      const modelState: Model = state.model ?? BAG_MODEL;
      const [model, collider] = await Loader.loadModel(modelState);

      if (!model) {
        return null;
      }

      return new this(state, model, collider ?? undefined);
    }
  };
};
