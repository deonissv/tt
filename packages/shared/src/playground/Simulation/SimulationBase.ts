import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import type { Scene } from '@babylonjs/core/scene';

import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';

// Side efects
import '@babylonjs/core/Culling/ray';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Physics/physicsEngineComponent'; // enablePhysics
import '@babylonjs/loaders/OBJ/objFileLoader';

import '@babylonjs/core/Engines/WebGPU/Extensions';

import { GRAVITY } from '@shared/constants';
import type { ActorStateUpdate } from '@shared/dto/simulation/ActorState';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/simulation/SimulationState';
import { Actor } from '../actors';

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
  protected engine: AbstractEngine;
  protected scene: Scene;
  protected initialState: SimulationStateSave;

  private initPhysics(gravity = GRAVITY) {
    const hp = new HavokPlugin(true, global.havok);
    const gravityVec = new Vector3(0, gravity, 0);

    this.scene.enablePhysics(gravityVec, hp);
  }

  get actors() {
    return this.scene.rootNodes.reduce((acc, node) => {
      const actorCandidate = node as Actor;
      if (actorCandidate && actorCandidate instanceof Actor) {
        acc.push(actorCandidate);
      }
      return acc;
    }, [] as Actor[]);
  }

  update(pgUpdate: SimulationStateUpdate) {
    pgUpdate?.actorStates?.forEach(actorState => {
      const actor = this.scene.getNodes().find(node => (node as Actor)?.guid === actorState.guid) as Actor | undefined;
      actor?.update(actorState);
    });
  }

  async loadState(state: SimulationStateSave) {
    await Promise.all((state?.actorStates ?? []).map(actorState => Actor.fromState(actorState)));
  }

  toStateUpdate(pgState?: SimulationStateSave): SimulationStateUpdate {
    const actorStates: ActorStateUpdate[] = [];
    this.actors.forEach(actor => {
      const actorState = pgState?.actorStates?.find(actorState => actorState.guid === actor.guid);
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
        return Actor.applyStateUpdate(actorState, update);
      });
    }

    return rv;
  }
}
