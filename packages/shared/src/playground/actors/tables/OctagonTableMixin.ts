import type { Constructor } from '@shared/types';
import type { SharedBase } from '../SharedBase';

export const OctagonTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class OctagonTable extends Base {};
};
