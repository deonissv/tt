import type { Die10State, Die12State, Die20State, Die4State, Die6State, Die8State } from '@shared/dto/states';
import { DieMixin } from '@shared/playground/actors/DieMixin';
import type { Constructor } from '@shared/types';
import { ServerBase } from './serverBase';

export class Die4 extends DieMixin<Constructor<ServerBase<Die4State>>, 4>(ServerBase) {}
export class Die6 extends DieMixin<Constructor<ServerBase<Die6State>>, 6>(ServerBase) {}
export class Die8 extends DieMixin<Constructor<ServerBase<Die8State>>, 8>(ServerBase) {}

export class Die10 extends DieMixin<Constructor<ServerBase<Die10State>>, 10>(ServerBase) {}
export class Die12 extends DieMixin<Constructor<ServerBase<Die12State>>, 12>(ServerBase) {}
export class Die20 extends DieMixin<Constructor<ServerBase<Die20State>>, 20>(ServerBase) {}
