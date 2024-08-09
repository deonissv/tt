import type { HavokPlugin, Scene } from '@babylonjs/core';
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
import { PICK_HIGHT } from '@shared/constants';
import type { ActorBaseState } from '@shared/dto/states';
import { SharedBase } from '@shared/playground/actors/SharedBase';

export class ServerActor<T extends ActorBaseState = ActorBaseState> extends SharedBase<T> {
  defaultY: number;
  obstacleHeight: number | null = null;

  constructor(state: T, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);

    const body = new PhysicsBody(this, PhysicsMotionType.DYNAMIC, false, this._scene);
    body.shape = new PhysicsShapeMesh(this.__model, this._scene);

    this.body = body;
    this.body.setMassProperties({
      mass: this.__mass,
      // centerOfMass: Vector3.Zero(),
      // inertia: Vector3.Zero(),
      inertia: Vector3.One(),
      inertiaOrientation: Quaternion.Identity(),
    });

    this._scene.onBeforeRenderObservable.add(() => this._beforeRender());
    this.body.setCollisionCallbackEnabled(true);
    this.body.disablePreStep = false;
    this._setTransformations(state.transformation);
    this._forceUpdate();

    this.defaultY = this.body.getBoundingBox().extendSize.y;
  }

  private _beforeRender() {
    if (this.picked && this.__targetPosition) {
      let upHeight = this.defaultY + PICK_HIGHT;

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
          rotation: Quaternion.Identity(),
          ignoreBody: this.body,
        },
        shapeLocalResult,
        hitWorldResult,
      );
      if (shapeLocalResult.hasHit && hitWorldResult.hasHit && hitWorldResult.body?.transformNode.name !== 'ground') {
        const body = hitWorldResult.body!;
        const maxBody = body.getBoundingBox().maximumWorld.y;
        upHeight += maxBody;
      } else {
        this.obstacleHeight = null;
      }

      if (this.obstacleHeight) {
        upHeight += this.obstacleHeight;
      }
      const pos = new Vector3(this.__targetPosition.x, upHeight, this.__targetPosition.y);
      this.body.setTargetTransform(pos, Quaternion.Identity());
    }
  }

  get hk(): HavokPlugin {
    return this.scene._physicsEngine?.getPhysicsPlugin() as HavokPlugin;
  }

  get scene(): Scene {
    return this._scene;
  }

  preventCollide(actor: ServerActor) {
    this.obstacleHeight = actor.body.getBoundingBox().maximumWorld.y;
  }

  pick() {
    this.__targetPosition = new Vector2(this.position.x, this.position.z);
    this.picked = true;
    this.body.setCollisionCallbackEnabled(false);
    this.body.shape!.isTrigger = true;
  }

  release() {
    this.picked = false;
    this.__targetPosition = null;
    this.body.setCollisionCallbackEnabled(true);
    this.body.shape!.isTrigger = false;
  }

  move(dx: number, dy: number) {
    const curr = this.__targetPosition ?? new Vector2(this.position.x, this.position.z);
    this.__targetPosition = curr.add(new Vector2(dx, dy));
  }
}
