import { DieMixin } from '@shared/playground/actors/DieMixin';
import { ServerActor } from './serverActor';

export class Die4 extends DieMixin<4>(ServerActor) {}
export class Die6 extends DieMixin<6>(ServerActor) {}
export class Die8 extends DieMixin<8>(ServerActor) {}
export class Die10 extends DieMixin<10>(ServerActor) {}
export class Die12 extends DieMixin<12>(ServerActor) {}
export class Die20 extends DieMixin<20>(ServerActor) {}
