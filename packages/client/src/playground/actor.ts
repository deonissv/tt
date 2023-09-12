import { Scene } from '@babylonjs/core/scene';
import { Nullable } from '@babylonjs/core/types';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Axis, Space, Vector3 } from '@babylonjs/core/Maths/math';
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PhysicsShapeMesh } from '@babylonjs/core/Physics/v2/physicsShape';
import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import { LIFH_HIGHT, MOUSE_MOVE_SENSETIVITY, ROTATE_STEP, SCALE_KOEF } from '@tt/shared';

export class Actor extends TransformNode {
  private __width: number;
  private __length: number;
  private __height: number;

  private __scaling = 0;

  private _model: Mesh;
  private _collider: Mesh;

  private _body: PhysicsBody;
  private _flipTranslate = 0;

  constructor(
    name: string,
    modelMesh: Mesh,
    colliderMesh?: Mesh,
    scene?: Nullable<Scene>,
    isPure?: boolean,
    position?: Vector3,
  ) {
    super(name, scene, isPure);
    this._scene = scene!;
    modelMesh.name = `${name}_model`;

    const dy = modelMesh.getBoundingInfo().minimum.y;
    modelMesh.position.y = -1 * dy;
    modelMesh.setPivotPoint(new Vector3(0, dy, 0));

    modelMesh.setParent(this);
    this._model = modelMesh;

    const vectorsWorld = modelMesh.getBoundingInfo().boundingBox.vectorsWorld;

    this.__width = Math.abs(vectorsWorld[1].x - vectorsWorld[0].x);
    this.__length = Math.abs(vectorsWorld[1].z - vectorsWorld[0].z);
    this.__height = Math.abs(vectorsWorld[1].y - vectorsWorld[0].y);

    if (position) {
      this.position = position;
    }

    if (!colliderMesh) {
      colliderMesh = modelMesh;
    } else {
      colliderMesh.isVisible = false;
      const nodeCollider = new Mesh(`${name}_collider`, this._scene);
      nodeCollider.setParent(this);
      colliderMesh.setParent(nodeCollider);
    }
    this._collider = colliderMesh;

    this._enablePhysics();
    this._flipTranslate = -1 * this.__height;
  }

  @Actor.prototype.humplePhysics
  pick() {
    this._body.setGravityFactor(0);
    this.position.addInPlace(new Vector3(0, LIFH_HIGHT, 0));
  }

  @Actor.prototype.humplePhysics
  move(dx: number, dy: number) {
    const diff = new Vector3(MOUSE_MOVE_SENSETIVITY * dx, 0, MOUSE_MOVE_SENSETIVITY * dy);
    this.position.addInPlace(diff);
  }

  @Actor.prototype.humplePhysics
  release() {
    this.position.addInPlace(new Vector3(0, -LIFH_HIGHT, 0));
    this._body.setGravityFactor(1);
  }

  @Actor.prototype.humplePhysics
  flip() {
    this._flipTranslate *= -1;
    this.translate(Axis.Y, this._flipTranslate, Space.WORLD);
    this.rotate(Axis.Z, Math.PI, Space.WORLD);
  }

  rotateCW() {
    this._rotate(-ROTATE_STEP);
  }

  rotateCCW() {
    this._rotate(ROTATE_STEP);
  }

  @Actor.prototype.humplePhysics
  _rotate(step: number) {
    this.rotate(Axis.Y, step, Space.WORLD);
  }

  scaleUp() {
    this._scale(SCALE_KOEF);
  }

  scaleDown() {
    this._scale(-SCALE_KOEF);
  }

  @Actor.prototype.humplePhysics
  _scale(step: number) {
    this.scaling.addInPlace(new Vector3(step, step, step));
    this._body.dispose();
    this._enablePhysics();
  }

  _enablePhysics() {
    this._collider.scaling.addInPlace(new Vector3(this.__scaling, this.__scaling, this.__scaling));
    const collider = new PhysicsShapeMesh(this._collider, this._scene);

    const agg = new PhysicsAggregate(this._model, collider, { mass: 1 }, this._scene);
    this._body = agg.body;
  }

  humplePhysics(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const f = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const _this = this as Actor;
      _this._body.disablePreStep = false;
      _this._scene.onAfterRenderObservable.addOnce(() => {
        _this._body.disablePreStep = true;
      });
      return f.apply(this, args);
    };
    Object.defineProperty(target, propertyKey, descriptor);
  }
}
