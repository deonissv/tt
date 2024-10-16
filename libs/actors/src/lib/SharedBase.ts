import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody';

import { Loader } from '@tt/loader';
import { Logger } from '@tt/logger';
import type {
  ActorBaseState,
  ActorState,
  ActorStateUpdate,
  TableState,
  Transformation,
  UnknownActorState,
} from '@tt/states';
import { floatCompare, vecDelta } from '@tt/utils';
import { DEFAULT_POSITION, DEFAULT_ROTATION, DEFAULT_SCALE } from './defaults';

export class SharedBase<T extends ActorBaseState = ActorBaseState> extends TransformNode {
  guid: string;

  __mass: number;
  __model: Mesh;
  __collider: Mesh;
  __state: T;

  body: PhysicsBody;
  __flipTranslate = 1;

  pickable = true;
  picked: string | null = null;

  constructor(state: T, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state.guid ?? state.name, undefined, true);

    this.guid = state.guid;

    this.__mass = state.mass ?? 1;
    this.__model = modelMesh;
    this.__collider = this._getColliderMesh(modelMesh, colliderMesh);

    this.__state = state;
    this.pickable = !state.locked;

    modelMesh.name = `${this.name}: model`;
    modelMesh.setParent(this);
    modelMesh.setEnabled(true);

    this._setTransformations(state.transformation);
    Logger.log(`Actor created. guid: ${this.guid} type: ${state?.type}`);
  }

  protected _getFlipTranslate(): number {
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

  get model(): Mesh {
    return this.__model;
  }

  protected _getColliderMesh(modelMesh: Mesh, colliderMesh?: Mesh): Mesh {
    if (!colliderMesh) {
      return modelMesh;
    } else {
      colliderMesh.isVisible = false;
      colliderMesh.name = `${this.name}: collider`;
      colliderMesh.setParent(this);
    }
    return colliderMesh;
  }

  protected _setMass(mass: number) {
    const m = this.body.getMassProperties();
    m.mass = mass;
    this.body.setMassProperties(m);
  }

  protected _setTransformations(transformation?: Transformation) {
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

  get transformation(): Required<Transformation> {
    return {
      scale: this.scaling.asArray(),
      rotation: this.rotation.asArray(),
      position: this.position.asArray(),
    };
  }

  _forceUpdate() {
    this.body.disablePreStep = false;
    this._scene.onAfterRenderObservable.addOnce(() => {
      this.body.disablePreStep = true;
    });
  }

  static fromState(_actorState?: ActorBaseState | TableState): Promise<SharedBase | null> {
    throw new Error('Not implemented: fromState');
  }

  static async modelFromState(actorState: ActorState, child = false): Promise<Mesh | null> {
    const modelMesh = await Loader.loadMesh(actorState.model.meshURL);

    if (!modelMesh) {
      Logger.error(`ActorBase.modelFromState: Model ${actorState.guid} not found`);
      return null;
    }

    if (child) {
      if (actorState.transformation?.position) modelMesh.position = new Vector3(...actorState.transformation.position);
      if (actorState.transformation?.rotation) modelMesh.rotation = new Vector3(...actorState.transformation.rotation);
      if (actorState.transformation?.scale) modelMesh.scaling = new Vector3(...actorState.transformation.scale);
    }

    const material = await Loader.loadModelMaterial(actorState.model, `${actorState.guid}: material`);
    if (material && actorState.colorDiffuse) {
      material.diffuseColor = new Color3(...actorState.colorDiffuse.slice(0, 3));
      if (actorState.colorDiffuse.length > 3) {
        material.alpha = actorState.colorDiffuse[3];
      }
    }
    modelMesh.material = material;

    let childMeshes: Mesh[] = [];
    if (actorState?.children) {
      const loadedMeshes = await Promise.all(actorState.children.map(child => SharedBase.modelFromState(child, true)));
      childMeshes = loadedMeshes.filter(mesh => mesh !== null);
    }

    const meshes = [modelMesh, ...childMeshes];
    const mesh = meshes.length > 1 ? Mesh.MergeMeshes(meshes, true, true, undefined, true, true)! : meshes[0];

    mesh.setEnabled(true);
    return mesh;
  }

  static async colliderFromState(actorState: ActorState): Promise<Mesh | null> {
    if (!actorState.model.colliderURL) {
      return null;
    }

    const colliderMesh = await Loader.loadMesh(actorState.model.colliderURL);

    if (!colliderMesh) {
      return null;
    }

    let childMeshes: Mesh[] = [];
    if (actorState?.children) {
      const loadedMeshes = await Promise.all(actorState.children.map(child => SharedBase.colliderFromState(child)));
      childMeshes = loadedMeshes.filter(mesh => mesh !== null);
    }

    const meshes = [colliderMesh, ...childMeshes];
    const mesh = meshes.length > 1 ? Mesh.MergeMeshes(meshes, true, true, undefined, true, true)! : meshes[0];

    mesh.setEnabled(true);
    return mesh;
  }

  toState<T extends typeof this>(): T['__state'] {
    return {
      ...this.__state,
      guid: this.guid,
      name: this.name,
      transformation: this.transformation,
      mass: this.__mass,
    };
  }

  toStateUpdate(actorState?: ActorBaseState): ActorStateUpdate | null {
    const currentState = this.toState();

    if (!actorState) {
      return null;
    }

    const rv: ActorStateUpdate = {
      guid: this.guid,
    };

    const stateTransformation = {
      scale: actorState.transformation?.scale ?? DEFAULT_SCALE,
      rotation: actorState.transformation?.rotation ?? DEFAULT_ROTATION,
      position: actorState.transformation?.position ?? DEFAULT_POSITION,
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
        scale: updateScale ? this.transformation.scale : undefined,
        rotation: updateRotation ? this.transformation.rotation : undefined,
        position: updatePosition ? this.transformation.position : undefined,
      };
    }

    if (Object.keys(rv).length === 1) {
      return null;
    }

    return rv;
  }

  toStateDelta(actorState?: ActorBaseState): ActorStateUpdate | null {
    const currentState = this.toState();

    if (!actorState) {
      return null;
    }

    const rv: ActorStateUpdate = {
      guid: this.guid,
    };

    const stateTransformation = {
      scale: actorState.transformation?.scale ?? DEFAULT_SCALE,
      rotation: actorState.transformation?.rotation ?? DEFAULT_ROTATION,
      position: actorState.transformation?.position ?? DEFAULT_POSITION,
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
        scale: vecDelta(currentState.transformation?.scale ?? DEFAULT_SCALE, stateTransformation.scale),
        rotation: vecDelta(currentState.transformation?.rotation ?? DEFAULT_ROTATION, stateTransformation.rotation),
        position: vecDelta(currentState.transformation?.position ?? DEFAULT_POSITION, stateTransformation.position),
      };
    }

    if (Object.keys(rv).length === 1) {
      return null;
    }

    return rv;
  }

  update(actorStateUpdate: ActorStateUpdate) {
    if (actorStateUpdate.transformation?.scale) {
      this.scaling = new Vector3(...actorStateUpdate.transformation.scale);
    }
    if (actorStateUpdate.transformation?.rotation) {
      this.rotation = new Vector3(...actorStateUpdate.transformation.rotation);
    }
    if (actorStateUpdate.transformation?.position) {
      this.position = new Vector3(...actorStateUpdate.transformation.position);
    }
  }

  static applyStateUpdate(actorState: UnknownActorState, actorStateUpdate: ActorStateUpdate): UnknownActorState {
    const mergedScale = actorStateUpdate.transformation?.scale ?? actorState.transformation?.scale;
    const mergedPosition = actorStateUpdate.transformation?.position ?? actorState.transformation?.position;
    const mergedRotation = actorStateUpdate.transformation?.rotation ?? actorState.transformation?.rotation;

    const rv = structuredClone(actorState);

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
