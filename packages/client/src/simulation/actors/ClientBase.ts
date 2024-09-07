import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { ActorBaseState } from '@shared/dto/states';
import { SharedBase } from '@shared/playground/actors/SharedBase';

export class ClientBase<T extends ActorBaseState = ActorBaseState> extends SharedBase<T> {
  constructor(state: T, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);
  }

  move(dx: number, dy: number, dz: number) {
    this.position = new Vector3(dx, dy, dz);
  }
}
