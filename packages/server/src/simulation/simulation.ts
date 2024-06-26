import { Scene } from '@babylonjs/core/scene';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';

import Actor from './actor';
import { SimulationBase } from '@shared/playground';
import type { ActorState, ActorStateUpdate, SimulationStateSave, SimulationStateUpdate } from '@shared/dto/simulation';

import '@babylonjs/core/Helpers'; // createDefaultCameraOrLight

export class Simulation extends SimulationBase {
  constructor(initialState: SimulationStateSave) {
    super();
    this.engine = new NullEngine();
    this.scene = new Scene(this.engine);
    this.initialState = initialState;
    this.scene.createDefaultCameraOrLight(false, false, false);
  }

  static async init(
    stateSave: SimulationStateSave,
    onModelLoaded?: () => void,
    onSucceed?: (ActorState) => void,
    onFailed?: (ActorState) => void,
  ): Promise<Simulation> {
    const sim = new Simulation(stateSave);
    sim.scene.useRightHandedSystem = stateSave?.leftHandedSystem === undefined ? true : !stateSave.leftHandedSystem;
    // sim.initPhysics(stateSave?.gravity);

    await Promise.all(
      (stateSave?.actorStates ?? []).map(async actorState => {
        const actor = await Actor.fromState(actorState);
        if (actor) {
          onSucceed?.(actorState);
        } else {
          onFailed?.(actorState);
        }
        onModelLoaded?.();
      }),
    );

    return sim;
  }

  start() {
    this.scene.executeWhenReady(() => {
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });
    });
  }

  toStateUpdate(pgState?: SimulationStateSave): SimulationStateUpdate {
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

  toStateSave(): SimulationStateSave {
    const actorStates: ActorState[] = [];
    this.scene.meshes.forEach(mesh => {
      if (mesh.parent instanceof Actor) {
        actorStates.push(mesh.parent.toState());
      }
    });

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
}
