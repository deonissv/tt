import type { Constructor } from '@tt/utils';
import type { SharedBase } from '../SharedBase';

export const SquareTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class SquareTable extends Base {};
};
