import { Scene } from '@babylonjs/core/scene';
import { Nullable } from '@babylonjs/core/types';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

import { PlaygroundStateUpdate, WS } from '@shared/index';
import { Loader } from './loader';
import { PointerDragBehavior } from '@babylonjs/core/Behaviors/Meshes/pointerDragBehavior';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { ActorState, ActorStateUpdate } from '@shared/dto/pg/actorState';
import { Transformation } from '@shared/dto/pg/transformation';

export default class Actor extends TransformNode {
  public guid: string;
  public buffer: Record<number, number[]> = {};

  private __model: Mesh;
  private __collider: Mesh;

  private __targetPosition: Vector3 | null = null;
  private __cursorPos: [number, number] = [0, 0];
  private __camera: ArcRotateCamera;

  private ws: WebSocket;

  constructor(state: ActorState, modelMesh: Mesh, colliderMesh?: Mesh, scene?: Nullable<Scene>, ws?: WebSocket) {
    super(state.name, scene, true);
    this.guid = state.guid;
    this.ws = ws!;

    this._scene = scene!;
    this.__camera = this._scene.activeCamera as ArcRotateCamera;
    this.__model = modelMesh;

    modelMesh.name = 'model';
    modelMesh.setParent(this);
    this.__collider = this._getColliderMesh(modelMesh, colliderMesh);

    if (state.transformation?.scale) {
      this.__model.scaling = new Vector3(...state.transformation.scale);
      this.__collider.scaling = new Vector3(...state.transformation.scale);
    }

    this.update(state);

    this._addDragBehavior();

    // this._scene.onBeforeRenderObservable.add(this._beforeRender.bind(this));
  }

  // private _beforeRender() {
  //   // console.log(this._scene.getEngine().getFps());
  //   if (this.__targetPosition) {
  //     // this.__targetPosition._y = this.position.y;
  //     const diff = this.__targetPosition.subtract(this.position);
  //     // console.log(this.__targetPosition.asArray(), diff.asArray(), this.position.asArray());

  //     const len = diff.length();
  //     if (len < PRECISION_EPSILON) {
  //       this.__targetPosition = null;
  //       this._body.setLinearVelocity(Vector3.Zero());
  //       this._body.setAngularVelocity(Vector3.Zero());
  //       return;
  //     }
  //     const fps = this._scene.getEngine().getFps();
  //     const t = 1 / fps;
  //     const scale = Math.min(len / t, MOVEMENT_VELOCITY);
  //     diff.normalize().scaleInPlace(scale);

  //     this._body.setLinearVelocity(diff);
  //     this._body.setAngularVelocity(Vector3.Zero());
  //     // console.log(diff);
  //     // console.log(diff, this._body.getLinearVelocity(), this._body.getAngularVelocity());
  //   }
  // }

  private _addDragBehavior() {
    const pointerDragBehavior = new PointerDragBehavior({ dragPlaneNormal: new Vector3(0, 1, 0) });
    pointerDragBehavior.moveAttached = false;
    pointerDragBehavior.detachCameraControls = false;

    pointerDragBehavior.onDragStartObservable.add(() => {
      // this.pick();
      this.__cursorPos = [this._scene.pointerX, this._scene.pointerY];
    });
    pointerDragBehavior.onDragObservable.add(() => {
      const prevCursorPos = this.__cursorPos;
      this.__cursorPos = [this._scene.pointerX, this._scene.pointerY];

      const cursorDX = this.__cursorPos[0] - prevCursorPos[0];
      const cursorDY = this.__cursorPos[1] - prevCursorPos[1];
      const sensitivity = 0.02;

      const dx = Math.cos(this.__camera.alpha) * cursorDY + Math.sin(this.__camera.alpha) * cursorDX;
      const dy = -Math.cos(this.__camera.alpha) * cursorDX + Math.sin(this.__camera.alpha) * cursorDY;

      const pgStateUpdate: PlaygroundStateUpdate = {
        actorStates: [
          {
            guid: this.guid,
            transformation: {
              position: [dx * sensitivity, 0, dy * sensitivity],
            },
          },
        ],
      };
      WS.send(this.ws, {
        type: WS.UPDATE,
        payload: pgStateUpdate,
      });
    });

    this.addBehavior(pointerDragBehavior);
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

  static async fromState(actorState: ActorState, scene: Scene, ws: WebSocket): Promise<Actor> {
    const [modelMesh, colliderMesh] = await Loader.loadModel(actorState.model, scene);
    const actor = new Actor(actorState, modelMesh, colliderMesh, scene, ws);
    return actor;
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
}
