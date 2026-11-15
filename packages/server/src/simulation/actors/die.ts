import { Vector3, type Mesh, type Quaternion } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import type { DieState } from '@tt/states';
import { DieFacesNumber } from '@tt/states';
import type { Constructor } from '@tt/utils';
import { roll } from '../behaviors/roll';
import { alignToAxis } from '../behaviors/transform';
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

  getPickRotation(): Quaternion {
    const currentRotation = this.absoluteRotationQuaternion.toEulerAngles();
    const closest = this.__state.rotationValues.reduce(
      (best, row) => {
        const distance = Vector3.DistanceSquared(currentRotation, Vector3.FromArray(row.rotation));
        return distance < best.distance ? { rotation: row.rotation, distance } : best;
      },
      { rotation: null as number[] | null, distance: Infinity },
    ).rotation;
    return alignToAxis(this.absoluteRotationQuaternion, closest ? Vector3.FromArray(closest) : Vector3.Up());
  }
  roll(): void {
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
