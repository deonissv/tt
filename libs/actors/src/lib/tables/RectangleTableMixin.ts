import { Constructor } from '@tt/utils';
import type { SharedBase } from '../SharedBase';

export const RectangleTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class RectangleTable extends Base {};
};
