import type { HavokPlugin } from '@babylonjs/core';
import {
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeMesh,
  Quaternion,
  ShapeCastResult,
  Vector3,
  type Mesh,
  type Vector2,
} from '@babylonjs/core';

import { SharedBase } from '@tt/actors';
import type { SimulationSceneBase } from '@tt/simulation';
import type { ActorBaseState } from '@tt/states';
import { flip, move, pick, release, rotate } from '../behaviors/transform';

export class ServerBase<T extends ActorBaseState = ActorBaseState> extends SharedBase<T> {
  defaultY: number;
  obstacleHeight: number | null = null;

  __targetPosition: Vector2 | null = null;
  __targetRotation: Quaternion | null = null;

  flipped = false;
  flipOffset = 0;
  pickHeight = 0;

  shapeLocalResult = new ShapeCastResult();
  hitWorldResult = new ShapeCastResult();

  constructor(state: T, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);

    const body = new PhysicsBody(this, PhysicsMotionType.DYNAMIC, false, this._scene);
    body.shape = new PhysicsShapeMesh(this.__model, this._scene);
    body.shape.material.restitution = 0;

    this.body = this.physicsBody!;
    this.body.setMassProperties({
      mass: 50,
      // centerOfMass: Vector3.Zero(),
      // inertia: Vector3.Zero(),
      inertia: Vector3.FromArray([0.3, 0.3, 0.3]),
      inertiaOrientation: Quaternion.Identity(),
    });
    this.body.shape!.material.restitution = 1;
    this.body.shape!.material.friction = 1;

    this._scene.onBeforeRenderObservable.add(() => this._beforeRender());
    this.body.setCollisionCallbackEnabled(true);
    this.body.disablePreStep = false;
    this._setTransformations(state.transformation);
    this._forceUpdate();

    this.defaultY = this.body.getBoundingBox().extendSize.y;
    this.flipOffset = this.getFlipOffset();

    if (state.locked) this.lock();
  }

  private _beforeRender() {
    if (this.picked !== null && this.__targetPosition !== null) {
      let upHeight = this.defaultY + this.pickHeight;
      if (this.flipped) upHeight += 2 * this.defaultY;

      this.shapeLocalResult.reset();
      this.hitWorldResult.reset();

      this.hk.shapeCast(
        {
          shape: this.body.shape!,
          startPosition: this.position,
          endPosition: this.position.add(new Vector3(0, -999, 0)),
          shouldHitTriggers: true,
          rotation: this.absoluteRotationQuaternion,
          ignoreBody: this.body,
        },
        this.shapeLocalResult,
        this.hitWorldResult,
      );

      if (this.shapeLocalResult.hasHit && this.hitWorldResult.hasHit) {
        upHeight += Math.max(0, this.hitWorldResult.hitPoint.y);
      } else {
        this.obstacleHeight = null;
      }
      const pos = new Vector3(this.__targetPosition.x, upHeight, this.__targetPosition.y);
      this.body.setTargetTransform(pos, this.__targetRotation ?? this.absoluteRotationQuaternion);
    }
  }

  get hk(): HavokPlugin {
    return this.scene._physicsEngine?.getPhysicsPlugin() as HavokPlugin;
  }

  get scene(): SimulationSceneBase {
    return this._scene as SimulationSceneBase;
  }

  pick(clientId: string, pickHeight: number) {
    pick(this, clientId, pickHeight);
  }

  release() {
    release(this);
  }

  move(dx: number, dy: number) {
    move(this, dx, dy);
  }

  getFlipOffset() {
    const bbox = this.body.getBoundingBox();
    const center = this.body.getObjectCenterWorld().y;
    const lCenter = (bbox.maximumWorld.y + bbox.minimumWorld.y) / 2;
    const offset = lCenter - center;
    return 2 * offset;
  }

  flip() {
    flip(this);
  }

  rotateCW(rotationAngle: number) {
    rotate(this, rotationAngle);
  }

  rotateCCW(rotationAngle: number) {
    rotate(this, -rotationAngle);
  }

  lock() {
    this.model.isPickable = false;
    this.body.setMotionType(0);
  }
}
