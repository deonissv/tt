import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';

// Side efects
import '@babylonjs/core/Culling/ray';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Physics/physicsEngineComponent'; // enablePhysics
import '@babylonjs/loaders/OBJ/objFileLoader';

import '@babylonjs/core/Engines/WebGPU/Extensions';

import type { ActorStateUpdate, TableState } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states/simulation/SimulationState';
import { SharedBase } from '../actors/SharedBase';
import type { ActorBuilder } from './ActorBuilder';
import { EngineFactory } from './SimulationEngine';
import type { SimulationSceneBase } from './SimulationSceneBase';

// WebGPU Extensions
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.alpha';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.renderTarget';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.uniformBuffer';

// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.computeShader';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.cubeTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.debugging';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.dynamicBuffer';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.dynamicTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.externalTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.multiRender';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.query';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.rawTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.readTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.renderTargetCube';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.textureSampler';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.storageBuffer';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.videoTexture';

export abstract class SimulationBase {
  static actorBuilder: ActorBuilder;
  engine: AbstractEngine;
  scene: SimulationSceneBase;
  initialState: SimulationStateSave;

  get actors() {
    return this.scene.actors;
  }

  static async initEngine(canvas: HTMLCanvasElement | undefined): Promise<AbstractEngine> {
    return await EngineFactory(canvas);
  }

  static async actorFromState(actorState: UnknownActorState): Promise<SharedBase | null> {
    return await this.actorBuilder.build(actorState);
  }

  static async tableFromState(tableState: TableState): Promise<SharedBase | null> {
    return await this.actorBuilder.buildTable(tableState);
  }

  start() {
    this.scene.executeWhenReady(() => {
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });
    });
  }

  stop() {
    this.engine.stopRenderLoop();
  }

  /**
   * Converts the current simulation state to a state update object.
   * Update object is an object that contains only the changes in the state. New values are actual values, NOT deltas.
   * @param simState - Optional simulation state save object.
   * @returns The simulation state update object.
   */
  toStateUpdate(simState?: SimulationStateSave): SimulationStateUpdate {
    const actorStates: ActorStateUpdate[] = [];
    this.actors.forEach(actor => {
      const actorState = simState?.actorStates?.find(actorState => actorState.guid === actor.guid);
      const stateUpdate = actor.toStateUpdate(actorState);
      if (stateUpdate) {
        actorStates.push(stateUpdate);
      }
    });

    if (actorStates.length === 0) {
      return {};
    }

    return {
      actorStates: actorStates,
    };
  }

  toStateDelta(simState?: SimulationStateSave): SimulationStateUpdate {
    const actorStates: ActorStateUpdate[] = [];
    this.actors.forEach(actor => {
      const actorState = simState?.actorStates?.find(actorState => actorState.guid === actor.guid);
      const stateUpdate = actor.toStateDelta(actorState);
      if (stateUpdate) {
        actorStates.push(stateUpdate);
      }
    });

    if (actorStates.length === 0) {
      return {};
    }

    return {
      actorStates: actorStates,
    };
  }

  static mergeStateDelta(state: SimulationStateSave, delta: SimulationStateUpdate): SimulationStateSave {
    const rv: SimulationStateSave = { actorStates: [] };

    const leftHandedSystemCandidate = delta.leftHandedSystem ?? state.leftHandedSystem;
    if (leftHandedSystemCandidate) {
      rv.leftHandedSystem = leftHandedSystemCandidate;
    }

    const gravityCandidate = delta.gravity ?? state.gravity;
    if (gravityCandidate) {
      rv.gravity = gravityCandidate;
    }

    if (state.actorStates) {
      rv.actorStates = state.actorStates.map(actorState => {
        const update = delta.actorStates?.find(actorUpdate => actorUpdate.guid === actorState.guid);
        if (!update) {
          return actorState;
        }
        return SharedBase.applyStateUpdate(actorState, update);
      });
    }

    return rv;
  }
}
