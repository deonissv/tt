import type { HavokPlugin } from '@babylonjs/core';
import {
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeMesh,
  Quaternion,
  ShapeCastResult,
  Vector2,
  Vector3,
  type Mesh,
} from '@babylonjs/core';
import { PRECISION_EPSILON } from '@shared/constants';
import type { DieBaseState } from '@shared/dto/states';
import { ActorType, type ActorBaseState } from '@shared/dto/states';
import type { SimulationSceneBase } from '@shared/playground';
import { SharedBase } from '@shared/playground/actors/SharedBase';

export class ServerBase<T extends ActorBaseState = ActorBaseState> extends SharedBase<T> {
  defaultY: number;
  obstacleHeight: number | null = null;

  __targetPosition: Vector2 | null = null;
  __targetRotation: Quaternion | null = null;

  flipped = false;
  pickHeight = 0;

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

    if (state.locked) this.lock();
  }

  private _beforeRender() {
    if (this.picked && this.__targetPosition) {
      let upHeight = this.defaultY + this.pickHeight;
      if (this.flipped) upHeight += 2 * this.defaultY;

      const shapeLocalResult = new ShapeCastResult();
      const hitWorldResult = new ShapeCastResult();
      shapeLocalResult.reset();
      hitWorldResult.reset();

      this.hk.shapeCast(
        {
          shape: this.body.shape!,
          startPosition: this.position,
          endPosition: this.position.add(new Vector3(0, -999, 0)),
          shouldHitTriggers: true,
          rotation: this.absoluteRotationQuaternion,
          ignoreBody: this.body,
        },
        shapeLocalResult,
        hitWorldResult,
      );

      if (shapeLocalResult.hasHit && hitWorldResult.hasHit) {
        upHeight += hitWorldResult.hitPoint.y;
      } else {
        this.obstacleHeight = null;
      }
      const pos = new Vector3(this.__targetPosition.x, upHeight, this.__targetPosition.y);
      this.body.setTargetTransform(pos, this.__targetRotation ?? this.absoluteRotationQuaternion);
    }
  }

  getNewTargetRotation() {
    const currentRotation = this.absoluteRotationQuaternion.toEulerAngles();
    const state = this.__state as unknown as DieBaseState;

    const rotationVariants =
      this.__state.type === ActorType.DIE4 ||
      this.__state.type === ActorType.DIE6 ||
      this.__state.type === ActorType.DIE8 ||
      this.__state.type === ActorType.DIE10 ||
      this.__state.type === ActorType.DIE12 ||
      this.__state.type === ActorType.DIE20 ||
      this.__state.type === ActorType.DIE6ROUND
        ? state.rotationValues.map(rv => rv.rotation)
        : [Vector3.Up().asArray()];

    const rotation = rotationVariants.reduce(
      (closest, rotation) => {
        const distance = Vector3.DistanceSquared(currentRotation, Vector3.FromArray(rotation));
        return distance < closest.distance ? { rotation, distance } : closest;
      },
      { rotation: null as number[] | null, distance: Infinity },
    ).rotation;

    const rv = rotation ? Vector3.FromArray(rotation) : Vector3.Up();
    return rv;
  }

  alignToAxis(quaternion: Quaternion, targetAxis: Vector3) {
    const currentAxis = new Vector3(0, 1, 0).applyRotationQuaternion(quaternion);
    targetAxis.normalize();

    if (Vector3.Distance(currentAxis, targetAxis) < PRECISION_EPSILON) {
      return quaternion;
    }

    if (Vector3.Distance(currentAxis, targetAxis.scale(-1)) < PRECISION_EPSILON) {
      const perpendicularAxis = Vector3.Cross(currentAxis, new Vector3(1, 0, 0));
      if (perpendicularAxis.length() < PRECISION_EPSILON) {
        perpendicularAxis.copyFromFloats(0, 0, 1);
      }
      return Quaternion.RotationAxis(perpendicularAxis, Math.PI).multiply(quaternion);
    }

    const rotationAxis = Vector3.Cross(currentAxis, targetAxis).normalize();
    const rotationAngle = Math.acos(Vector3.Dot(currentAxis, targetAxis));

    const correction = Quaternion.RotationAxis(rotationAxis, rotationAngle);
    const result = correction.multiply(quaternion);

    return result.normalize();
  }

  get hk(): HavokPlugin {
    return this.scene._physicsEngine?.getPhysicsPlugin() as HavokPlugin;
  }

  get scene(): SimulationSceneBase {
    return this._scene as SimulationSceneBase;
  }

  pick(clientId: string, pickHeight: number) {
    if (this.picked) return;

    this.body.setLinearVelocity(Vector3.Zero());
    this.body.setAngularVelocity(Vector3.Zero());
    this.pickHeight = pickHeight;

    this.__targetPosition = new Vector2(this.position.x, this.position.z);

    const rotation = this.absoluteRotationQuaternion;

    this.__targetRotation =
      this.__state.type === ActorType.CARD || this.__state.type === ActorType.DECK
        ? rotation
        : this.alignToAxis(rotation, this.getNewTargetRotation());

    this.picked = clientId;
    this.body.setCollisionCallbackEnabled(false);
    this.body.shape!.isTrigger = true;
  }

  release() {
    this.picked = null;
    this.pickHeight = 0;
    this.__targetPosition = null;
    this.body.setCollisionCallbackEnabled(true);
    this.body.shape!.isTrigger = false;
  }

  move(dx: number, dy: number) {
    this.__targetPosition?.addInPlaceFromFloats(dx, dy);
  }

  flip() {
    const rotationAxis = Vector3.Right().applyRotationQuaternion(this.absoluteRotationQuaternion);
    const flipRotation = Quaternion.RotationAxis(rotationAxis, Math.PI);
    this.__targetRotation = this.absoluteRotationQuaternion.multiply(flipRotation);
    this.flipped = !this.flipped;
  }

  rotateCW(rotationAngle: number) {
    const currentUp = Vector3.Up().applyRotationQuaternion(this.absoluteRotationQuaternion);
    const rotationQuaternion = Quaternion.RotationAxis(currentUp, rotationAngle);
    this.__targetRotation = this.absoluteRotationQuaternion.multiply(rotationQuaternion);
  }

  rotateCCW(rotationAngle: number) {
    const currentUp = Vector3.Up().applyRotationQuaternion(this.absoluteRotationQuaternion);
    const rotationQuaternion = Quaternion.RotationAxis(currentUp, -1 * rotationAngle);
    this.__targetRotation = this.absoluteRotationQuaternion.multiply(rotationQuaternion);
  }

  lock() {
    this.model.isPickable = false;
    this.body.setMotionType(0);
  }
}
