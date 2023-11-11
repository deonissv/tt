import { Scene } from '@babylonjs/core/scene';
import { Nullable } from '@babylonjs/core/types';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Axis, Quaternion, Space, Vector3 } from '@babylonjs/core/Maths/math';
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PhysicsShapeMesh } from '@babylonjs/core/Physics/v2/physicsShape';
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';

import {
  ActorState,
  ActorStateUpdate,
  LIFH_HIGHT,
  MOVEMENT_VELOCITY,
  PRECISION_DELTA,
  ROTATE_STEP,
  SCALE_KOEF,
  Transformation,
  WS,
} from '@shared/index';
import { Loader } from './loader';
import { PointerDragBehavior } from '@babylonjs/core/Behaviors/Meshes/pointerDragBehavior';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';

const FPS = 60; // @TODO switch to 30/45 if needed

export default class Actor extends TransformNode {
  public guid: string;

  private __canvas: HTMLCanvasElement;

  private __mass: number;
  private __model: Mesh;
  private __collider: Mesh;

  private _body: PhysicsBody;
  private __flipTranslate = 0;
  private __targetPosition: Vector3 | null = null;
  private __cursorPos: [number, number] = [0, 0];
  private __camera: ArcRotateCamera;

  constructor(state: ActorState, modelMesh: Mesh, colliderMesh?: Mesh, scene?: Nullable<Scene>) {
    super(state.name, scene, true);
    this.guid = state.guid;

    this._scene = scene!;
    this.__camera = this._scene.activeCamera as ArcRotateCamera;

    this.__canvas = this._scene.getEngine().getRenderingCanvas()!;
    this.__mass = state.mass ?? 1;
    this.__model = modelMesh;

    if (state.transformation?.scale) {
      this.__model.scaling = new Vector3(...state.transformation.scale);
      this.__collider.scaling = new Vector3(...state.transformation.scale);
    }

    modelMesh.name = 'model';
    modelMesh.setParent(this);
    this.__collider = this._getColliderMesh(modelMesh, colliderMesh);

    const body = new PhysicsBody(this, PhysicsMotionType.DYNAMIC, false, this._scene);
    body.shape = new PhysicsShapeMesh(this.__collider, this._scene);

    this._body = body;
    this._body.setMassProperties({
      mass: this.__mass,
      // centerOfMass: Vector3.Zero(),
      // inertia: Vector3.Zero(),
      inertia: Vector3.One(),
      inertiaOrientation: Quaternion.Identity(),
    });
    this.update(state);

    this.__flipTranslate = 1;

    // this._addDragBehavior();

    this._scene.onBeforeRenderObservable.add(this._beforeRender.bind(this));
    this._forceUpdate();
  }

  private _beforeRender() {
    // console.log(this._scene.getEngine().getFps());
    if (this.__targetPosition) {
      // this.__targetPosition._y = this.position.y;
      const diff = this.__targetPosition.subtract(this.position);
      // console.log(this.__targetPosition.asArray(), diff.asArray(), this.position.asArray());

      const len = diff.length();
      if (len < PRECISION_DELTA) {
        this.__targetPosition = null;
        this._body.setLinearVelocity(Vector3.Zero());
        this._body.setAngularVelocity(Vector3.Zero());
        return;
      }
      const fps = this._scene.getEngine().getFps();
      const t = 1 / fps;
      const scale = Math.min(len / t, MOVEMENT_VELOCITY);
      diff.normalize().scaleInPlace(scale);

      this._body.setLinearVelocity(diff);
      this._body.setAngularVelocity(Vector3.Zero());
      // console.log(diff);
      // console.log(diff, this._body.getLinearVelocity(), this._body.getAngularVelocity());
    }
  }

  private _addDragBehavior() {
    const pointerDragBehavior = new PointerDragBehavior({ dragPlaneNormal: new Vector3(0, 1, 0) });
    pointerDragBehavior.moveAttached = false;
    pointerDragBehavior.detachCameraControls = false;

    pointerDragBehavior.onDragStartObservable.add(() => {
      this.pick();
      this.__cursorPos = [this._scene.pointerX, this._scene.pointerY];
    });
    pointerDragBehavior.onDragObservable.add(() => {
      const prevCursorPos = this.__cursorPos;
      this.__cursorPos = [this._scene.pointerX, this._scene.pointerY];

      const cursorDX = this.__cursorPos[0] - prevCursorPos[0];
      const cursorDY = this.__cursorPos[1] - prevCursorPos[1];
      const sensetivity = 0.02;

      const dx = Math.cos(this.__camera.alpha) * cursorDY + Math.sin(this.__camera.alpha) * cursorDX;
      const dy = -Math.cos(this.__camera.alpha) * cursorDX + Math.sin(this.__camera.alpha) * cursorDY;

      this.__move(dx * sensetivity, 0, dy * sensetivity);
      // this.move(new Vector3(event.dragPlanePoint.x, 0, event.dragPlanePoint.z));
    });
    pointerDragBehavior.onDragEndObservable.add(this.release.bind(this));

    this.addBehavior(pointerDragBehavior);
  }

  private _getFlipTranslate(): number {
    const delta =
      this.__flipTranslate > 0
        ? this.__model.getBoundingInfo().maximum.y - this.position.y
        : this.__model.getBoundingInfo().minimum.y + this.position.y;

    return this.__flipTranslate * delta;
  }

  get vectorsWorld(): Vector3[] {
    return this.__model.getBoundingInfo().boundingBox.vectorsWorld;
  }

  get height(): number {
    const vectorsWorld = this.vectorsWorld;
    const h = Math.abs(vectorsWorld[1].y - vectorsWorld[0].y);
    return h;
  }

  private _getColliderMesh(modelMesh: Mesh, colliderMesh?: Mesh): Mesh {
    if (!colliderMesh) {
      return modelMesh;
    } else {
      colliderMesh.isVisible = false;
      colliderMesh.name = 'collider';
      colliderMesh.setParent(this);
    }
    return colliderMesh;
  }

  private _setMass(mass: number) {
    const m = this._body.getMassProperties();
    m.mass = mass;
    this._body.setMassProperties(m);
  }

  pick() {
    this._setMass(0);
    this.__move(0, LIFH_HIGHT, 0);
    // this.__model.translate(Axis.Y, LIFH_HIGHT, Space.LOCAL);
    // this._forceUpdate();
    this.emitUpdate();
  }

  release() {
    this._setMass(this.__mass);
    this._body.applyImpulse(new Vector3(0, 0, 0), this.getAbsolutePosition());
    this.emitUpdate();
  }

  get transformation(): Transformation {
    return {
      scale: this.scaling.asArray(),
      rotation: this.rotation.asArray(),
      position: this.position.asArray(),
    };
  }

  move(targetPosition: Vector3) {
    this.__targetPosition = targetPosition;
  }

  __move(dx: number, dy: number, dz: number) {
    const pos = this.__targetPosition ?? this.position;
    this.__targetPosition = pos.add(new Vector3(dx, dy, dz));
  }

  flip() {
    const ft = this._getFlipTranslate();

    // this.__flipTranslate *= -1;
    // this.translate(Axis.Y, ft, Space.WORLD);

    // this.rotate(Axis.Z, Math.PI, Space.LOCAL);
    // this._forceUpdate();
  }

  rotateCW() {
    this._rotate(-ROTATE_STEP);
  }

  rotateCCW() {
    this._rotate(ROTATE_STEP);
  }

  _rotate(step: number) {
    this.rotate(Axis.Y, step, Space.WORLD);
    this._forceUpdate();
  }

  scaleUp() {
    this._scale(SCALE_KOEF);
  }

  scaleDown() {
    this._scale(-SCALE_KOEF);
  }

  _scale(step: number) {
    this.scaling.addInPlace(new Vector3(step, step, step));
    const colliderShape = new PhysicsShapeMesh(this.__collider, this._scene);
    this._body.shape = colliderShape;
  }

  _forceUpdate() {
    this._body.disablePreStep = false;
    this._scene.onAfterRenderObservable.addOnce(() => {
      this._body.disablePreStep = true;
    });
  }

  emitUpdate() {
    this.__canvas.dispatchEvent(new WS.PGUpdate(this.guid, this.transformation));
  }

  static async fromState(actorState: ActorState, scene: Scene): Promise<Actor> {
    const [modelMesh, colliderMesh] = await Loader.loadModel(actorState.model, scene);
    const actor = new Actor(actorState, modelMesh, colliderMesh, scene);
    return actor;
  }

  update(actorStateUpdate: ActorStateUpdate) {
    if (actorStateUpdate.transformation?.scale) {
      this.__model.scaling = new Vector3(...actorStateUpdate.transformation.scale);
    }
    if (actorStateUpdate.transformation?.rotation) {
      this.rotation = new Vector3(...actorStateUpdate.transformation.rotation);
    }
    if (actorStateUpdate.transformation?.position) {
      this.position = new Vector3(...actorStateUpdate.transformation.position);
    }
    this._forceUpdate();
  }
}
