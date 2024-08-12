import type { Constructor } from '@shared/types';
import type { SharedBase } from '../SharedBase';

export const CustomRectangleTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class CustomRectangleTable extends Base {};
};
