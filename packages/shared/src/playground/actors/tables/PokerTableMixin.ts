import type { Constructor } from '@shared/types';
import type { SharedBase } from '../SharedBase';

export const PokerTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class PokerTable extends Base {};
};
