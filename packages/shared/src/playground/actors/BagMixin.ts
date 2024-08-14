import type { BagState } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import type { Constructor } from '@shared/types';
import type { SharedBase } from './SharedBase';

export const BagMixin = <T extends Constructor<SharedBase<BagState>>>(Base: T) => {
  return class Bag extends Base {
    items: UnknownActorState[];

    get size() {
      return this.items.length;
    }
  };
};
