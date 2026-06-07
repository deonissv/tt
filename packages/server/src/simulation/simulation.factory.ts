import { Injectable } from '@nestjs/common';
import type { SimulationStateSave, UnknownActorState } from '@tt/states';
import { Simulation } from './simulation';

@Injectable()
export class SimulationFactory {
  async create(
    stateSave: SimulationStateSave,
    onModelLoaded?: () => void,
    onSucceed?: (actorState: UnknownActorState) => void,
    onFailed?: (actorState: UnknownActorState) => void,
  ): Promise<Simulation> {
    const sim = new Simulation(stateSave);
    sim.logger.log('Simulation instance created');

    sim.initPhysics(stateSave?.gravity);

    if (stateSave.table) {
      try {
        await Simulation.tableFromState(stateSave.table);
      } catch (e) {
        sim.logger.error(`Failed to load table: ${String(e)}`);
      }
    }

    await Promise.all(
      (stateSave?.actorStates ?? []).map(async actorState => {
        try {
          const actor = await Simulation.actorFromState(actorState);
          if (actor) {
            onSucceed?.(actorState);
          } else {
            onFailed?.(actorState);
          }
          onModelLoaded?.();
        } catch (e) {
          onFailed?.(actorState);
          sim.logger.error(`Failed to load actor ${actorState.guid}: ${String(e)}`);
        }
      }),
    );

    return sim;
  }
}
