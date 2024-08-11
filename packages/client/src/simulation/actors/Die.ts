import type { DieNState, DieType } from '@shared/dto/states';
import { DieMixin } from '@shared/playground/actors/DieMixin';
import type { Constructor } from '@shared/types';
import { ClientBase } from './ClientBase';

type Die<N extends DieType> = ClientBase<DieNState<N>>;

export class Die4 extends DieMixin<Constructor<Die<4>>, 4>(ClientBase) {}
export class Die6 extends DieMixin<Constructor<Die<6>>, 6>(ClientBase) {}
export class Die8 extends DieMixin<Constructor<Die<8>>, 8>(ClientBase) {}
export class Die10 extends DieMixin<Constructor<Die<10>>, 10>(ClientBase) {}
export class Die12 extends DieMixin<Constructor<Die<12>>, 12>(ClientBase) {}
export class Die20 extends DieMixin<Constructor<Die<20>>, 20>(ClientBase) {}
