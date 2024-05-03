import {
  LIFH_HIGHT,
  MASS_DEFAULT,
  MOVEMENT_VELOCITY,
  PRECISION_EPSILON,
  ROTATE_STEP,
  SCALE_KOEF,
} from '@shared/constants';

import {
  Axis,
  Mesh,
  Nullable,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeMesh,
  Quaternion,
  Scene,
  Space,
  TransformNode,
  Vector3,
} from 'babylonjs';
import { Loader } from '../loader';
import { floatCompare } from '@shared/utils';
import { Model } from '@shared/dto/pg/actorModel';
import { ActorState, ActorStateUpdate } from '@shared/dto/pg/actorState';
import { Transformation } from '@shared/dto/pg/transformation';

export default class Actor extends TransformNode {
  static DEFAULT_MASS = 1;
  static DEFAULT_SCALE = [1, 1, 1];
  static DEFAULT_ROTATION = [0, 0, 0];
  static DEFAULT_POSITION = [0, 0, 0];

  public guid: string;

  private __mass: number;
  private __model: Mesh;
  private __stateModel: Model;

  public _body: PhysicsBody;
  private __flipTranslate = 0;
  private __targetPosition: Vector3 | null = null;

  constructor(state: ActorState, modelMesh: Mesh, scene?: Nullable<Scene>) {
    super(state.name, scene, true);
    this.guid = state.guid;
    this.__stateModel = state.model;

    this._scene = scene!;

    this.__mass = state.mass ?? 1;
    this.__model = modelMesh;

    if (state.transformation?.scale) {
      this.__model.scaling = new Vector3(...state.transformation.scale);
    }

    modelMesh.name = 'model';
    modelMesh.setParent(this);

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

    this.__flipTranslate = 1;
    this._setTransformations(state?.transformation);
    // this._addDragBehavior();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    // this._scene.onBeforeRenderObservable.add(this._beforeRender.bind(this));
    // this._forceUpdate();
  }

  private _beforeRender() {
    if (this.__targetPosition) {
      // this.__targetPosition._y = this.position.y;
      const diff = this.__targetPosition.subtract(this.position);

      const len = diff.length();
      if (len < PRECISION_EPSILON) {
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
    }
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

  get mass(): number {
    return this.__mass;
  }

  private _setMass(mass: number) {
    const m = this._body.getMassProperties();
    m.mass = mass;
    this._body.setMassProperties(m);
  }

  private _setTransformations(transformation?: Transformation) {
    if (transformation?.scale) {
      this.scaling = new Vector3(...transformation.scale);
    }
    if (transformation?.rotation) {
      this.rotation = new Vector3(...transformation.rotation);
    }
    if (transformation?.position) {
      this.position = new Vector3(...transformation.position);
    }
  }

  pick() {
    this._setMass(0);
    this.move(0, LIFH_HIGHT, 0);
    // this.__model.translate(Axis.Y, LIFH_HIGHT, Space.LOCAL);
    // this._forceUpdate();
  }

  release() {
    this._setMass(this.__mass);
    this._body.applyImpulse(new Vector3(0, 0, 0), this.getAbsolutePosition());
  }

  get transformation(): Transformation {
    return {
      scale: this.scaling.asArray(),
      rotation: this.rotation.asArray(),
      position: this.position.asArray(),
    };
  }

  move(dx: number, dy: number, dz: number) {
    const pos = this.__targetPosition ?? this.position;
    this.__targetPosition = pos.add(new Vector3(dx, dy, dz));
  }

  flip() {
    // const ft = this._getFlipTranslate();
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
    const colliderShape = new PhysicsShapeMesh(this.__model, this._scene);
    this._body.shape = colliderShape;
  }

  _forceUpdate() {
    this._body.disablePreStep = false;
    this._scene.onAfterRenderObservable.addOnce(() => {
      this._body.disablePreStep = true;
    });
  }

  static async fromState(actorState: ActorState, scene: Scene): Promise<Actor | null> {
    const model = await Loader.loadModel(actorState.model, scene);

    if (!model) {
      return null;
    }

    const actor = new Actor(actorState, model, scene);
    return actor;
  }

  toState() {
    return {
      guid: this.guid,
      name: this.name,
      model: this.__stateModel,
      transformation: this.transformation,
      mass: this.__mass,
    };
  }

  toStateUpdate(actorState?: ActorState): ActorStateUpdate | null {
    const currentState = this.toStateSave();

    if (!actorState) {
      return currentState;
    }

    const rv: ActorStateUpdate = {
      guid: this.guid,
    };

    if (actorState.name !== this.name) {
      rv.name = this.name;
    }

    if (!floatCompare(actorState.mass ?? MASS_DEFAULT, this.mass)) {
      rv.mass = this.__mass;
    }

    const stateTransformation = {
      scale: actorState.transformation?.scale ?? Actor.DEFAULT_SCALE,
      rotation: actorState.transformation?.rotation ?? Actor.DEFAULT_ROTATION,
      position: actorState.transformation?.position ?? Actor.DEFAULT_POSITION,
    };

    const updatePosition = stateTransformation.position.some(
      (v, i) => !floatCompare(v, currentState.transformation?.position?.[i] ?? 0),
    );

    const updateRotation = stateTransformation.rotation.some(
      (v, i) => !floatCompare(v, currentState.transformation?.rotation?.[i] ?? 0),
    );

    const updateScale = stateTransformation.scale.some(
      (v, i) => !floatCompare(v, currentState.transformation?.scale?.[i] ?? 1),
    );

    if (updatePosition || updateRotation || updateScale) {
      rv.transformation = {
        scale: updateScale ? stateTransformation.scale : undefined,
        rotation: updateRotation ? stateTransformation.rotation : undefined,
        position: updatePosition ? stateTransformation.position : undefined,
      };
    }

    if (Object.keys(rv).length === 1) {
      return null;
    }

    return rv;
  }

  toStateSave(): ActorState {
    return {
      guid: this.guid,
      name: this.name,
      model: this.__stateModel,
      transformation: this.transformation,
      mass: this.__mass,
    };
  }

  update(actorStateUpdate: ActorStateUpdate) {
    if (actorStateUpdate.transformation?.position) {
      const pos = actorStateUpdate.transformation.position as [number, number, number];
      this.move(...pos);
    }
  }

  static applyStateUpdate(actorState: ActorState, actorStateUpdate: ActorStateUpdate): ActorState {
    const mergedScale = actorStateUpdate.transformation?.scale ?? actorState.transformation?.scale;
    const mergedPosition = actorStateUpdate.transformation?.position ?? actorState.transformation?.position;
    const mergedRotation = actorStateUpdate.transformation?.rotation ?? actorState.transformation?.rotation;

    const rv: ActorState = {
      guid: actorStateUpdate.guid,
      model: actorStateUpdate.model ?? actorState.model,
      name: actorStateUpdate.name ?? actorState.name,
    };

    if (mergedScale !== undefined || mergedPosition !== undefined || mergedRotation !== undefined) {
      rv.transformation = {
        scale: mergedScale,
        rotation: mergedRotation,
        position: mergedPosition,
      };
    }

    return rv;
  }
}
