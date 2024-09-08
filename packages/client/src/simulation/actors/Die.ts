import { getDieModel } from '@shared/assets';
import type { DieState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { DieMixin } from '@shared/playground/actors/DieMixin';
import type { Constructor } from '@shared/types';
import { ClientBase } from './ClientBase';

export class ClientDie extends ClientBase<DieState> {
  numFaces: number;

  static async fromState<T extends ClientDie>(this: Constructor<T>, state: DieState): Promise<T | null> {
    const modelProps = getDieModel(state);
    const [model, collider] = await Loader.loadModel(modelProps);

    if (!model) {
      return null;
    }

    return new this(state, model, collider ?? undefined);
  }
}

export class Die4 extends DieMixin(ClientDie) {}
export class Die6 extends DieMixin(ClientDie) {}
export class Die8 extends DieMixin(ClientDie) {}

export class Die10 extends DieMixin(ClientDie) {}
export class Die12 extends DieMixin(ClientDie) {}
export class Die20 extends DieMixin(ClientDie) {}
