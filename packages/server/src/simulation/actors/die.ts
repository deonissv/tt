import type { DieNState, DieType } from '@shared/dto/states';
import { DieMixin } from '@shared/playground/actors/DieMixin';
import type { Constructor } from '@shared/types';
import { ServerActor } from './serverActor';

type Die<N extends DieType> = ServerActor<DieNState<N>>;

export class Die4 extends DieMixin<Constructor<Die<4>>, 4>(ServerActor) {}
export class Die6 extends DieMixin<Constructor<Die<6>>, 6>(ServerActor) {}
export class Die8 extends DieMixin<Constructor<Die<8>>, 8>(ServerActor) {}
export class Die10 extends DieMixin<Constructor<Die<10>>, 10>(ServerActor) {}
export class Die12 extends DieMixin<Constructor<Die<12>>, 12>(ServerActor) {}
export class Die20 extends DieMixin<Constructor<Die<20>>, 20>(ServerActor) {}
