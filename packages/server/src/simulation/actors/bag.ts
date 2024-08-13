import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { BagState } from '@shared/dto/states';
import type { Containable } from '@shared/playground/actions/Containable';
import { BagMixin } from '@shared/playground/actors/BagMixin';
import type { Constructor } from '@shared/types';
import { ServerActorBuilder } from '../serverActorBuilder';
import { ServerBase } from './serverBase';

export class Bag extends BagMixin<Constructor<ServerBase<BagState>>>(ServerBase) implements Containable {
  constructor(state: BagState, model: Mesh, colliderMesh?: Mesh) {
    super(state, model, colliderMesh);
    this.items = state.containedObjects;
  }

  async pickItem() {
    if (this.size < 1) {
      return;
    }

    const item = this.items.pop()!;

    item.transformation = this.transformation;
    item.transformation.position![0] -= 4;

    const newActor = await ServerActorBuilder.build(item);
    return newActor;
  }
}
