import {
  ArcRotateCamera,
  CreateBox,
  CreateGround,
  CreateSphere,
  HavokPlugin,
  NullEngine,
  PhysicsAggregate,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeMesh,
  PhysicsShapeType,
  Scene,
  Vector3,
} from 'babylonjs';

import { ActorState, ActorStateUpdate, GRAVITY, PlaygroundStateSave, PlaygroundStateUpdate } from '@shared/index';
import Actor from './actor';

export class Simulation {
  private engine: NullEngine;
  private scene: Scene;

  constructor() {
    this.engine = new NullEngine();
    this.scene = new Scene(this.engine);
    new ArcRotateCamera('Camera', 0, 0.8, 100, Vector3.Zero(), this.scene);
  }

  async init(stateSave?: PlaygroundStateSave) {
    this.scene.useRightHandedSystem = stateSave?.leftHandedSystem === undefined ? false : stateSave.leftHandedSystem;
    this.initPhysics(stateSave?.gravity);
    const ground = CreateGround('___ground', { width: 100, height: 100 }, this.scene);
    ground.isPickable = false;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, this.scene);

    await Promise.all((stateSave?.actorStates ?? []).map(actorState => Actor.fromState(actorState, this.scene)));
  }

  start() {
    this.scene.executeWhenReady(() => {
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });
    });
  }

  update(pgUpdate: PlaygroundStateUpdate) {
    pgUpdate?.actorStates?.forEach(actorState => {
      const actor = this.scene.getNodes().find(node => (node as Actor)?.guid === actorState.guid) as Actor;
      actor.update(actorState);
    });
  }

  toSaveState(): PlaygroundStateUpdate {
    const actorStates: ActorStateUpdate[] = [];
    this.scene.meshes.forEach(mesh => {
      if (mesh.parent instanceof Actor) {
        actorStates.push(mesh.parent.toState());
      }
    });
    return {
      actorStates: actorStates,
    };
  }

  _toSaveState(): PlaygroundStateSave {
    const actorStates: ActorState[] = [];
    this.scene.meshes.forEach(mesh => {
      if (mesh.parent instanceof Actor) {
        actorStates.push(mesh.parent._toState());
      }
    });

    if (actorStates.length === 0) {
      return {};
    }
    return {
      actorStates: actorStates,
    };
  }

  private initPhysics(gravity = GRAVITY) {
    const hp = new HavokPlugin(true, global.havok);
    const gravityVec = new Vector3(0, gravity, 0);

    this.scene.enablePhysics(gravityVec, hp);
  }

  testSphere() {
    const sphere = CreateSphere('___sphere', { diameter: 1 }, this.scene);
    sphere.position = new Vector3(0, 10, 0);
    const body = new PhysicsBody(sphere, PhysicsMotionType.DYNAMIC, false, this.scene);
    body.shape = new PhysicsShapeMesh(sphere, this.scene);
  }

  testBox() {
    const boxModel = CreateBox('___box', { width: 1, height: 1, depth: 1 }, this.scene);
    new Actor(
      {
        name: 'box',
        guid: '3',
        model: {
          meshURL: '',
        },
        transformation: {
          position: [0, 10, 0],
        },
      },
      boxModel,
      this.scene,
    );
    // box.__move(0, 10, 0);
    // eslint-disable-next-line no-console
    console.log('box created');
  }
}
