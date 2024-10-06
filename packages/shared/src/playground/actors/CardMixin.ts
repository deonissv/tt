import type { CardState } from '@tt/states';
import type { Constructor } from '@shared/types';
import type { SharedBase } from './SharedBase';

export const CardMixin = <T extends Constructor<SharedBase<CardState>>>(Base: T) => {
  return class Card extends Base {};
};
