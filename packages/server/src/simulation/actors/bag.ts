import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { BagState } from '@shared/dto/states';
import { BagMixin } from '@shared/playground/actors/BagMixin';
import type { Constructor } from '@shared/types';
import { ServerActor } from './serverActor';

export class Bag extends BagMixin<Constructor<ServerActor<BagState>>>(ServerActor) {
  constructor(state: BagState, model: Mesh, colliderMesh?: Mesh) {
    super(state, model, colliderMesh);
    this.items = state.containedObjects;
  }
}
