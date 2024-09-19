import { Color3, type StandardMaterial } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { ActorBaseState } from '@shared/dto/states';
import { SharedBase } from '@shared/playground/actors/SharedBase';

export class ClientBase<T extends ActorBaseState = ActorBaseState> extends SharedBase<T> {
  constructor(state: T, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);

    if (this.__model.material) {
      const mat = this.__model.material as StandardMaterial;
      if (state.colorDiffuse) {
        mat.diffuseColor = new Color3(state.colorDiffuse[0], state.colorDiffuse[1], state.colorDiffuse[2]);
      }
    }
  }

  move(dx: number, dy: number, dz: number) {
    this.position = new Vector3(dx, dy, dz);
  }
}
