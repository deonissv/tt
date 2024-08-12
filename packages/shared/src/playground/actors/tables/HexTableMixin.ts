import type { Constructor } from '@shared/types';
import type { SharedBase } from '../SharedBase';

export const HexTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class HexTable extends Base {};
};
