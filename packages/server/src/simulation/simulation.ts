import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';

import type { ActorStateUpdate, SimulationStateSave, SimulationStateUpdate } from '@shared/dto/simulation';
import { SimulationBase } from '@shared/playground';

import '@babylonjs/core/Helpers'; // createDefaultCameraOrLight
import { Logger } from '@nestjs/common';

export class Simulation extends SimulationBase {
  logger: Logger;

  private constructor(initialState: SimulationStateSave) {
    super();
    this.engine = new NullEngine();
    this.scene = new Scene(this.engine);
    this.initialState = initialState;
    this.scene.createDefaultCameraOrLight(false, false, false);
    this.logger = new Logger(Simulation.name);
  }

  static async init(
    stateSave: SimulationStateSave,
    onModelLoaded?: () => void,
    onSucceed?: (ActorState) => void,
    onFailed?: (ActorState) => void,
  ): Promise<Simulation> {
    const sim = new Simulation(stateSave);
    sim.logger.log('Simulation instance created');

    sim.scene.useRightHandedSystem = stateSave?.leftHandedSystem === undefined ? true : !stateSave.leftHandedSystem;
    // sim.initPhysics(stateSave?.gravity);

    await Promise.all(
      (stateSave?.actorStates ?? []).map(async actorState => {
        try {
          const actor = await SimulationBase.actorFromState(actorState);
          if (actor) {
            onSucceed?.(actorState);
          } else {
            onFailed?.(actorState);
          }
          onModelLoaded?.();
        } catch (e) {
          onFailed?.(actorState);
          sim.logger.error(`Failed to load actor ${actorState.guid}: ${e}`);
        }
      }),
    );
    sim.logger.log('Simulation actors created');

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

  toState(): SimulationStateSave {
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
