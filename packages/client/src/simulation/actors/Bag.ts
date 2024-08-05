import type { Mesh } from '@babylonjs/core';
import type { BagState } from '@shared/dto/states';
import { BagMixin } from '@shared/playground/actors/BagMixin';
import { ClientBase } from './ClientBase';

export class Bag extends BagMixin(ClientBase<BagState>) {
  constructor(state: BagState, model: Mesh, colliderMesh?: Mesh) {
    super(state, model, colliderMesh);
    this.items = state.containedObjects;
  }
}
