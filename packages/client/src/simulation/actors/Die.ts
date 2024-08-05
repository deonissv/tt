import { DieMixin } from '@shared/playground/actors/DieMixin';
import { ClientBase } from './ClientBase';

export class Die4 extends DieMixin<4>(ClientBase) {}
export class Die6 extends DieMixin<6>(ClientBase) {}
export class Die8 extends DieMixin<8>(ClientBase) {}
export class Die10 extends DieMixin<10>(ClientBase) {}
export class Die12 extends DieMixin<12>(ClientBase) {}
export class Die20 extends DieMixin<20>(ClientBase) {}
