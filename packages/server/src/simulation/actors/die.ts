import { Vector3, type Mesh } from '@babylonjs/core';
import { Loader } from '@shared/playground';
import { DieMixin } from '@shared/playground/actors/DieMixin';
import type { Constructor } from '@shared/types';
import { getRandomInt } from '@shared/utils';
import type { DieState } from '@tt/states';
import { DieFacesNumber } from '@tt/states';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

const ROLL_IMPULSE_MIX = 450;
const ROLL_IMPULSE_MAX = 600;

const ROLL_ANGULAR_IMPULSE_MIX = 50;
const ROLL_ANGULAR_IMPULSE_MAX = 70;

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
    const impulse = this.mass * getRandomInt(ROLL_IMPULSE_MIX, ROLL_IMPULSE_MAX);
    const imluseAngularX = getRandomInt(this.mass * ROLL_ANGULAR_IMPULSE_MIX, this.mass * ROLL_ANGULAR_IMPULSE_MAX);
    const imluseAngularY = getRandomInt(this.mass * ROLL_ANGULAR_IMPULSE_MIX, this.mass * ROLL_ANGULAR_IMPULSE_MAX);
    const imluseAngularZ = getRandomInt(this.mass * ROLL_ANGULAR_IMPULSE_MIX, this.mass * ROLL_ANGULAR_IMPULSE_MAX);

    this.body.setLinearVelocity(new Vector3(0, 0, 0));

    this.pick('', 0.5);
    setTimeout(() => {
      this.release();
      setTimeout(() => {
        this.body.applyImpulse(new Vector3(0, impulse, 0), this.body.getObjectCenterWorld());
        this.body.applyAngularImpulse(new Vector3(imluseAngularX, imluseAngularY, imluseAngularZ));
      }, 50);
    }, 50);
  }
}

export class Die4 extends DieMixin(ServerDie) {}
export class Die6 extends DieMixin(ServerDie) {}
export class Die8 extends DieMixin(ServerDie) {}

export class Die10 extends DieMixin(ServerDie) {}
export class Die12 extends DieMixin(ServerDie) {}
export class Die20 extends DieMixin(ServerDie) {}

export class Die6Round extends DieMixin(ServerDie) {
  static async fromState<T extends ServerDie>(this: Constructor<T>, state: DieState): Promise<T | null> {
    const model = await Loader.loadMesh(AssetsManager.ROUNDED_DIE.colliderURL);

    if (!model) return null;

    return new this(state, model);
  }
}
