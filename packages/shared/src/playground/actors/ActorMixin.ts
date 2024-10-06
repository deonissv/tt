import type { ActorState } from '@tt/states';
import type { Constructor } from '@shared/types';
import type { SharedBase } from './SharedBase';

export const ActorMixin = <T extends Constructor<SharedBase<ActorState>>>(Base: T) => {
  return class Actor extends Base {};
};
