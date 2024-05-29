import { GRAVITY, PlaygroundStateSave, PlaygroundStateUpdate, SpecialObjectsMapper } from '@shared/index';
import { ActorState, ActorStateUpdate } from '@shared/dto/pg/actorState';
import { SpecialObjcetsBuilder } from './specialObjects.ts/specialObjcetsBuilder';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { PhysicsShapeMesh } from '@babylonjs/core/Physics/v2/physicsShape';
import { PhysicsBody } from '@babylonjs/core/Physics/v2/physicsBody';
import { PhysicsMotionType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';

// Side efects
import '@babylonjs/core/Culling/ray';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/loaders/OBJ/objFileLoader';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Physics/physicsEngineComponent'; // enablePhysics
import '@babylonjs/core/Helpers/sceneHelpers'; // createDefaultCameraOrLight

// WebGPU Extensions
import '@babylonjs/core/Engines/WebGPU/Extensions/engine.alpha';
import '@babylonjs/core/Engines/WebGPU/Extensions/engine.renderTarget';
import Actor from './actor';
import { EngineStore } from '@babylonjs/core/Engines/engineStore';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.uniformBuffer';

export class Simulation {
  private engine: NullEngine;
  private scene: Scene;
  private initialState: PlaygroundStateSave;

  constructor(initialState: PlaygroundStateSave) {
    this.engine = new NullEngine();
    this.scene = new Scene(this.engine);
    this.initialState = initialState;

    this.scene.createDefaultCameraOrLight(true, true, false);
    console.log('Simulation created');
  }

  static async init(
    stateSave: PlaygroundStateSave,
    onModelLoaded: () => void,
    onSucceed?: (ActorState) => void,
    onFailed?: (ActorState) => void,
  ): Promise<Simulation> {
    const sim = new Simulation(stateSave);
    sim.scene.useRightHandedSystem = stateSave?.leftHandedSystem === undefined ? true : stateSave.leftHandedSystem;
    // sim.initPhysics(stateSave?.gravity);

    await this.initTable('rectangleCustom');

    await Promise.all(
      (stateSave?.actorStates ?? []).map(async actorState => {
        const actor = await Actor.fromState(actorState);
        if (actor) {
          onSucceed && onSucceed(actorState);
        } else {
          onFailed && onFailed(actorState);
        }
        onModelLoaded();
      }),
    );

    return sim;
  }

  static async initTable(table: SpecialObjectsMapper['tables']): Promise<Actor> {
    const tableMesh = await SpecialObjcetsBuilder.tables[table]();
    return tableMesh as Actor;
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
      const actor = this.scene.getNodes().find(node => (node as Actor)?.guid === actorState.guid) as Actor | undefined;
      actor?.update(actorState);
    });
  }

  toStateUpdate(pgState?: PlaygroundStateSave): PlaygroundStateUpdate {
    const actorStates: ActorStateUpdate[] = [];
    this.scene.meshes.forEach(mesh => {
      if (mesh.parent instanceof Actor) {
        const actorState = pgState?.actorStates?.find(actorState => actorState.guid === (mesh.parent as Actor).guid);
        const stateUpdate = mesh.parent.toStateUpdate(actorState);
        if (stateUpdate) {
          actorStates.push(stateUpdate);
        }
      }
    });

    if (actorStates.length === 0) {
      return {};
    }

    return {
      actorStates: actorStates,
    };
  }

  toStateSave(): PlaygroundStateSave {
    const actorStates: ActorState[] = [];
    this.scene.meshes.forEach(mesh => {
      if (mesh.parent instanceof Actor) {
        actorStates.push(mesh.parent.toStateSave());
      }
    });

    if (actorStates.length === 0) {
      return {};
    }

    return {
      ...this.initialState,
      actorStates: actorStates
        .filter(actorState => actorState.guid != '')
        .map(state => {
          const initActorState = this.initialState.actorStates!.find(actorState => actorState.guid === state.guid);
          return {
            ...initActorState,
            ...state,
          };
        }),
    };
  }

  private initPhysics(gravity = GRAVITY) {
    const hp = new HavokPlugin(true, global.havok);
    const gravityVec = new Vector3(0, 0, 0);

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
      boxModel,
      this.scene,
    );
    // box.__move(0, 10, 0);
    // eslint-disable-next-line no-console
    console.log('box created');
  }

  static mergeStateDelta(state: PlaygroundStateSave, delta: PlaygroundStateUpdate): PlaygroundStateSave {
    const rv: PlaygroundStateSave = {
      leftHandedSystem: delta.leftHandedSystem ?? state.leftHandedSystem,
      gravity: delta.gravity ?? state.gravity,
      actorStates: state.actorStates,
    };

    if (state.actorStates) {
      rv.actorStates = state.actorStates.map(actorState => {
        const update = delta.actorStates?.find(actorUpdate => actorUpdate.guid === actorState.guid);
        if (!update) {
          return actorState;
        }
        return Actor.applyStateUpdate(actorState, update);
      });
    }

    return rv;
  }
}
