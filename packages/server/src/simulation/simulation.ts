import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';

import type { ActorStateUpdate, SimulationStateSave, SimulationStateUpdate } from '@shared/dto/simulation';
import { SimulationBase } from '@shared/playground';
import Actor from './actor';

import '@babylonjs/core/Helpers'; // createDefaultCameraOrLight

export class Simulation extends SimulationBase {
  private constructor(initialState: SimulationStateSave) {
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

  toStateSave(): SimulationStateSave {
    const actorStates = this.actors.map(actor => actor.toState());

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
