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
  TableState,
  TileState,
} from '@shared/dto/states';
import { ActorType, type ActorStateBase } from '@shared/dto/states';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states/simulation/SimulationState';
import type { Action } from '@shared/ws/ws';
import { ACTIONS } from '@shared/ws/ws';
import { isContainable } from '../actions/Containable';
import { Actor, ActorBase, Card, Deck, RectangleCustomTable } from '../actors';
import { Bag } from '../actors/Bag';
import { Tile } from '../actors/Tile';

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
      case ActorType.BAG:
        return await Bag.fromState(actorState as BagState);
      case ActorType.CARD:
        return await Card.fromState(actorState as CardState);
      case ActorType.DECK:
        return await Deck.fromState(actorState as DeckState);
      case ActorType.ACTOR:
        return await Actor.fromState(actorState as ActorState);
      default:
        // eslint-disable-next-line no-console
        console.error(`Unknown actor type: ${actorState.type}`);
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
