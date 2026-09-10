import type { BagState, UnknownActorState } from '@tt/states';
import type { Constructor } from '@tt/utils';
import type { SharedBase } from './SharedBase';

export const BagMixin = <T extends Constructor<SharedBase<BagState>>>(Base: T) => {
  return class Bag extends Base {
    items: UnknownActorState[];

    get size() {
      return this.items.length;
    }
  };
};
