import type { Mesh } from '@babylonjs/core';
import type { BagState } from '@shared/dto/states';
import { BagMixin } from '@shared/playground/actors/BagMixin';
import { ServerActor } from './serverActor';

export class Bag extends BagMixin(ServerActor<BagState>) {
  constructor(state: BagState, model: Mesh, colliderMesh?: Mesh) {
    super(state, model, colliderMesh);
    this.items = state.containedObjects;
  }
}
