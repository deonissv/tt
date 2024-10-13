import type { Constructor } from '@tt/utils';
import type { SharedBase } from '../SharedBase';

export const CustomSquareTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class CustomSquareTable extends Base {};
};
