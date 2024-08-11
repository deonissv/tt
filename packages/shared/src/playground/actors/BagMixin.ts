import { STATIC_HOST } from '@shared/constants';
import type { ActorBaseState, BagState, Model } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import type { Containable } from '../actions/Containable';
import { Loader } from '../Loader';
import { SimulationBase } from '../Simulation';
import type { SharedBase } from './SharedBase';

const BAG_MODEL: Model = {
  meshURL: `${STATIC_HOST}/Group1.obj`,
  normalURL: `${STATIC_HOST}/bag_N.png`,
  specularURL: `${STATIC_HOST}/bag_S.png`,
  diffuseURL: `${STATIC_HOST}/2-bag_D_gray.png`,
};

export const BagMixin = <T extends Constructor<SharedBase<BagState>>>(Base: T) => {
  return class Bag extends Base implements Containable {
    items: ActorBaseState[];

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

    async pickItem() {
      if (this.size < 1) {
        return;
      }

      const item = this.items.pop()!;

      item.transformation = this.transformation;
      item.transformation.position![0] -= 4;

      const newActor = await SimulationBase.actorFromState(item);
      return newActor;
    }
  };
};
