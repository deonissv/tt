import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { BAG_MODEL } from '@shared/assets';
import type { BagState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import type { Containable } from '@shared/playground/actions/Containable';
import { BagMixin } from '@shared/playground/actors/BagMixin';
import type { Constructor } from '@shared/types';
import { shuffle } from '@shared/utils';
import { ServerActorBuilder } from '../serverActorBuilder';
import { ServerBase } from './serverBase';

export class Bag extends BagMixin<Constructor<ServerBase<BagState>>>(ServerBase) implements Containable {
  constructor(state: BagState, model: Mesh, colliderMesh?: Mesh) {
    super(state, model, colliderMesh);
    this.items = state.containedObjects;
  }

  async pickItem(clientId: string): Promise<ServerBase | null> {
    if (this.size < 1) {
      return null;
    }

    const item = this.items.pop()!;

    item.transformation = this.transformation;
    item.transformation.position![1] += 1;

    const newActor = await ServerActorBuilder.build(item);
    newActor?.pick(clientId);

    return newActor;
  }

  static async fromState(state: BagState): Promise<Bag | null> {
    const colliderURL = state.model ? (state.model.colliderURL ?? state.model.meshURL) : BAG_MODEL.colliderURL;

    const model = await Loader.loadMesh(colliderURL);

    if (!model) {
      return null;
    }

    return new this(state, model);
  }

  shuffle() {
    shuffle(this.items);
  }
}
