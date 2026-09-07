import type { Mesh } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import type { DieState } from '@tt/states';
import { DieFacesNumber } from '@tt/states';
import type { Constructor } from '@tt/utils';
import { roll } from '../behaviors/roll';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class ServerDie extends ServerBase<DieState> {
  numFaces: number;

  constructor(state: DieState, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);

    this.numFaces = DieFacesNumber[state.type];
  }

  static async fromState<T extends ServerDie>(this: Constructor<T>, state: DieState): Promise<T | null> {
    const model = AssetsManager.getDieModel(state);
    const collider = await Loader.loadMesh(model.colliderURL);
    if (!collider) return null;

    return new this(state, collider);
  }

  roll() {
    roll(this);
  }
}

export class Die4 extends ServerDie {}
export class Die6 extends ServerDie {}
export class Die8 extends ServerDie {}

export class Die10 extends ServerDie {}
export class Die12 extends ServerDie {}
export class Die20 extends ServerDie {}

export class Die6Round extends ServerDie {
  static async fromState<T extends ServerDie>(this: Constructor<T>, state: DieState): Promise<T | null> {
    const model = await Loader.loadMesh(AssetsManager.ROUNDED_DIE.colliderURL);

    if (!model) return null;

    return new this(state, model);
  }
}
