import { Mesh, StandardMaterial } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { getDieModel, ROUNDED_DIE } from '@shared/assets';
import type { Die6RoundState, DieBaseState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { DieMixin } from '@shared/playground/actors/DieMixin';
import type { Constructor } from '@shared/types';
import { ClientBase } from './ClientBase';

export class ClientDie extends ClientBase<DieBaseState> {
  numFaces: number;

  static async fromState<T extends ClientDie>(this: Constructor<T>, state: DieBaseState): Promise<T | null> {
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

export class Die6Round extends DieMixin(ClientDie) {
  declare __state: Die6RoundState;

  static async fromState<T extends ClientDie>(this: Constructor<T>, state: Die6RoundState): Promise<T | null> {
    const [model, collider] = await Loader.loadModel(ROUNDED_DIE);

    if (!model) {
      return null;
    }

    if (state.colorDiffuse && model.material) {
      const base = model.clone();
      base.material = new StandardMaterial('base');
      (base.material as StandardMaterial).diffuseColor = new Color3(...state.colorDiffuse);

      (model.material as StandardMaterial).diffuseTexture!.hasAlpha = true;
      (model.material as StandardMaterial).useAlphaFromDiffuseTexture = true;

      const rv = Mesh.MergeMeshes([model, base], true, true, undefined, true, true);
      return new this(state, rv, collider ?? undefined);
    }

    return new this(state, model, collider ?? undefined);
  }
}
