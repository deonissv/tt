import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { ActorState } from '@shared/dto/simulation';
import { ActorBase } from './ActorBase';

export class Actor extends ActorBase {
  constructor(actorState: ActorState, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(
      actorState.guid,
      actorState.name,
      modelMesh,
      colliderMesh,
      actorState.transformation,
      actorState.mass,
      actorState.colorDiffuse,
    );
    this.__state = actorState;
  }

  //   constructor(
  //     guid: string,
  //     name: string,
  //     modelMesh: Mesh,
  //     colliderMesh?: Mesh,
  //     transformation?: Transformation,
  //     mass?: number,
  //     colorDiffuse?: number[],
  //     scene: Scene | null = null,
  //   ) {
  //     super(name, scene, true);

  //     this.guid = guid;

  //     this._scene = scene ?? this.getEngine().scenes[0];

  //     this.__mass = mass ?? 1;
  //     this.__model = modelMesh;
  //     this.__collider = this._getColliderMesh(modelMesh, colliderMesh);

  //     if (transformation?.scale) {
  //       this.__model.scaling = new Vector3(...transformation.scale);
  //     }

  //     modelMesh.name = 'model';
  //     modelMesh.setParent(this);

  //     this.colorDiffuse = colorDiffuse ?? [];

  //     // const body = new PhysicsBody(this, PhysicsMotionType.DYNAMIC, false, this._scene);
  //     // body.shape = new PhysicsShapeMesh(this.__model, this._scene);

  //     // this._body = body;
  //     // this._body.setMassProperties({
  //     //   mass: this.__mass,
  //     //   // centerOfMass: Vector3.Zero(),
  //     //   // inertia: Vector3.Zero(),
  //     //   inertia: Vector3.One(),
  //     //   inertiaOrientation: Quaternion.Identity(),
  //     // });

  //     this.__flipTranslate = 1;
  //     this._setTransformations(transformation);
  //     // this._addDragBehavior();

  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //     // this._scene.onBeforeRenderObservable.add(this._beforeRender.bind(this));
  //     // this._forceUpdate();
  //   }

  static async fromState(actorState: ActorState): Promise<Actor | null> {
    const modelMesh = await Actor.modelFromState(actorState);
    if (!modelMesh) {
      console.log('Failed to load model mesh');
      return null;
    }

    const colliderMesh = (await Actor.colliderFromState(actorState)) ?? undefined;
    return new Actor(actorState, modelMesh, colliderMesh);
  }
}
