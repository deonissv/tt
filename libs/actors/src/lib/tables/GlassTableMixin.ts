import { Constructor } from '@tt/utils';
import type { SharedBase } from '../SharedBase';

export const GlassTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class GlassTable extends Base {};
};
