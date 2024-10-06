import { Constructor } from '@tt/utils';
import type { SharedBase } from '../SharedBase';

export const CircleTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class CircleTable extends Base {};
};
