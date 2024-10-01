import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { BagState, Model } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { BagMixin } from '@shared/playground/actors/BagMixin';
import { AssetsManager } from './AssetsManages';
import { ClientBase } from './ClientBase';

export class Bag extends BagMixin(ClientBase<BagState>) {
  constructor(state: BagState, model: Mesh, colliderMesh?: Mesh) {
    super(state, model, colliderMesh);
    this.items = state.containedObjects;
  }

  static async fromState(state: BagState): Promise<Bag | null> {
    const modelState: Model = state.model ?? AssetsManager.BAG_MODEL;
    const [model, collider] = await Loader.loadModel(modelState);

    if (!model) {
      return null;
    }

    return new this(state, model, collider ?? undefined);
  }
}
