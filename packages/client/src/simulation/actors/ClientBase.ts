import type { Mesh } from '@babylonjs/core';
import type { ActorBaseState } from '@shared/dto/states';
import { SharedBase } from '@shared/playground/actors/SharedBase';

export class ClientBase<T extends ActorBaseState = ActorBaseState> extends SharedBase<T> {
  constructor(state: T, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);
  }
}
