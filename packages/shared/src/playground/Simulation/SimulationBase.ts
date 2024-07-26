import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import type { Scene } from '@babylonjs/core/scene';

// Side efects
import '@babylonjs/core/Culling/ray';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Physics/physicsEngineComponent'; // enablePhysics
import '@babylonjs/loaders/OBJ/objFileLoader';

import '@babylonjs/core/Engines/WebGPU/Extensions';

import type {
  ActorState,
  ActorStateUpdate,
  BagState,
  CardState,
  DeckState,
  Die10State,
  Die12State,
  Die20State,
  Die4State,
  Die6State,
  Die8State,
  TableState,
  TileState,
} from '@shared/dto/states';
import { ActorType, type ActorStateBase } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states/simulation/SimulationState';
import type { Logger } from '@shared/logger';
import type { Action } from '@shared/ws/ws';
import { ACTIONS } from '@shared/ws/ws';
import { isContainable } from '../actions/Containable';
import {
  Actor,
  ActorBase,
  Bag,
  Card,
  Deck,
  Die10,
  Die12,
  Die20,
  Die4,
  Die6,
  Die8,
  RectangleCustomTable,
  Tile,
} from '../actors';
import { TileStack } from '../actors/TileStack';

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
  logger: Logger | null = null;

  engine: AbstractEngine;
  scene: Scene;
  initialState: SimulationStateSave;

  // private initPhysics(gravity = GRAVITY) {
  //   const hp = new HavokPlugin(true, global.havok);
  //   const gravityVec = new Vector3(0, gravity, 0);

  //   this.scene.enablePhysics(gravityVec, hp);
  // }

  get actors() {
    return this.scene.rootNodes.reduce((acc, node) => {
      const actorCandidate = node as Actor;
      if (actorCandidate && actorCandidate instanceof ActorBase && !actorCandidate.guid.startsWith('#')) {
        acc.push(actorCandidate);
      }
      return acc;
    }, [] as Actor[]);
  }

  static async actorFromState(actorState: ActorStateBase): Promise<ActorBase | null> {
    switch (actorState.type) {
      case ActorType.TILE:
        return await Tile.fromState(actorState as TileState);
      case ActorType.TILE_STACK:
        return await TileStack.fromState(actorState as TileStackState);
      case ActorType.BAG:
        return await Bag.fromState(actorState as BagState);
      case ActorType.CARD:
        return await Card.fromState(actorState as CardState);
      case ActorType.DECK:
        return await Deck.fromState(actorState as DeckState);
      case ActorType.ACTOR:
        return await Actor.fromState(actorState as ActorState);
      case ActorType.DIE4:
        return await Die4.fromState(actorState as Die4State);
      case ActorType.DIE6:
        return await Die6.fromState(actorState as Die6State);
      case ActorType.DIE8:
        return await Die8.fromState(actorState as Die8State);
      case ActorType.DIE10:
        return await Die10.fromState(actorState as Die10State);
      case ActorType.DIE12:
        return await Die12.fromState(actorState as Die12State);
      case ActorType.DIE20:
        return await Die20.fromState(actorState as Die20State);
      case ActorType.TABLE:
        return null;
    }
  }

  static async tableFromState(tableState: TableState): Promise<ActorBase | null> {
    switch (tableState.type) {
      case 'Rectangle':
      case 'Custom':
        return await RectangleCustomTable.fromState(tableState);
      default:
        return null;
    }
  }

  update(simUpdate: SimulationStateUpdate) {
    simUpdate?.actorStates?.forEach(actorState => {
      const actor = this.scene.getNodes().find(node => (node as Actor)?.guid === actorState.guid) as Actor | undefined;
      actor?.update(actorState);
    });

    simUpdate?.actions?.forEach(action => this.processAction(action));
  }

  processAction(action: Action) {
    switch (action.type) {
      case ACTIONS.PICK_ITEM: {
        const deckGUID = action.payload;
        const actor = this.actors.find(a => a.guid === deckGUID);
        if (isContainable(actor)) {
          try {
            actor.pickItem();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          }
        }
      }
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
