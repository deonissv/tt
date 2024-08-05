import type { Mesh } from '@babylonjs/core';
import type { ActorBaseState } from '@shared/dto/states';
import { SharedBase } from '@shared/playground/actors/SharedBase';

export class ServerActor<T extends ActorBaseState = ActorBaseState> extends SharedBase<T> {
  constructor(state: T, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);

    // const body = new PhysicsBody(this, PhysicsMotionType.DYNAMIC, false, this._scene);
    // body.shape = new PhysicsShapeMesh(this.__model, this._scene);

    // this._body = body;
    // this._body.setMassProperties({
    //   mass: this.__mass,
    //   // centerOfMass: Vector3.Zero(),
    //   // inertia: Vector3.Zero(),
    //   inertia: Vector3.One(),
    //   inertiaOrientation: Quaternion.Identity(),
    // });
  }
}
