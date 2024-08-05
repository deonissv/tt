import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';

// Side efects
import '@babylonjs/core/Culling/ray';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Physics/physicsEngineComponent'; // enablePhysics
import '@babylonjs/loaders/OBJ/objFileLoader';

import '@babylonjs/core/Engines/WebGPU/Extensions';

import type { Tuple } from '@babylonjs/core/types';
import type { ActorStateUpdate, TableState } from '@shared/dto/states';
import { type ActorBaseState } from '@shared/dto/states';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states/simulation/SimulationState';
import { isTuple } from '@shared/guards';
import { WS } from '@shared/ws';
import { isContainable } from '../actions/Containable';
import { SharedBase } from '../actors/SharedBase';
import { Logger } from '../Logger';
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
  engine: AbstractEngine;
  scene: SimulationSceneBase;
  initialState: SimulationStateSave;

  // private initPhysics(gravity = GRAVITY) {
  //   const hp = new HavokPlugin(true, global.havok);
  //   const gravityVec = new Vector3(0, gravity, 0);

  //   this.scene.enablePhysics(gravityVec, hp);
  // }

  get actors() {
    return this.scene.actors;
  }

  static async initEngine(canvas: HTMLCanvasElement | undefined): Promise<AbstractEngine> {
    return await EngineFactory(canvas);
  }

  static actorFromState(_actorState: ActorBaseState): Promise<SharedBase | null> {
    throw new Error('Method not implemented.');
  }

  static tableFromState(_tableState: TableState): Promise<SharedBase | null> {
    throw new Error('Method not implemented.');
  }

  start() {
    this.scene.executeWhenReady(() => {
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });
    });
  }

  update(msg: WS.MSG) {
    msg.map(msg => this.handleAction(msg));
  }

  handleAction(action: WS.SimAction) {
    switch (action.type) {
      case WS.SimActionType.MOVE_ACTOR: {
        this.handleMoveActor(action.payload.guid, action.payload.position);
        break;
      }
      case WS.SimActionType.PICK_ITEM: {
        this.handlePickItem(action.payload);
        break;
      }
    }
  }

  handlePickItem(containerGUID: string) {
    const actor = this.actors.find(a => a.guid === containerGUID);
    if (isContainable(actor)) {
      try {
        actor.pickItem();
      } catch (e) {
        Logger.error(e);
      }
    }
  }

  handleMoveActor(guid: string, position: Tuple<number, 3>) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) {
      actor.move(...position);
    }
  }

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

  getSimActions(simStateUpdate: SimulationStateUpdate): WS.SimAction[] {
    const actions: WS.SimAction[] = [];

    simStateUpdate.actorStates?.forEach(actorState => {
      if (actorState.transformation?.position && isTuple(actorState.transformation.position, 3))
        actions.push({
          type: WS.SimActionType.MOVE_ACTOR,
          payload: { guid: actorState.guid, position: actorState.transformation.position },
        });
    });

    return actions;
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
