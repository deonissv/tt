import type { SimulationStateSave } from '@tt/states';
import { Simulation } from '../simulation/simulation';
import type { DownloadProgress } from '@tt/actions';
import { Logger } from '@nestjs/common';

export type onReady = (simulation: Simulation, DownloadProgress: DownloadProgress) => void;
export type onDownloadProgress = (DownloadProgress: DownloadProgress) => void;

/**
 * The `SimulationBuilder` class is responsible for initializing and managing the progress updates.
 * Instance of the class is intended to be used for tracking the progress of the simulation initialization.
 *
 * onReady callback is always called on object initialization including the case when the simulation is already ready.
 * onDownloadProgressArr callback will be omitted if the simulation is already ready.
 *
 */
export class SimulationBuilder {
  private readonly logger = new Logger('SimulationBuilder');

  private simulation: Simulation | null = null;
  private downloadProgress: DownloadProgress = {
    total: 0,
    loaded: 0,
    succeeded: 0,
    failed: 0,
  };

  /**
   * An array of callback functions to be executed when the simulation is ready.
   * onReady callback is always called on object initialization including the case wCallback will be omitted if the simulation is already ready.hen the simulation is already ready.
   */
  private onReadyArr: onReady[] = [];

  /**
   * An array of callback functions to be executed when the simulation download progress changes.
   * Callback will be omitted if the simulation is already ready.
   */
  private onDownloadProgressArr: onDownloadProgress[] = [];

  set onReady(onReady: onReady) {
    if (this.simulation) {
      onReady(this.simulation, this.downloadProgress);
    } else {
      this.onReadyArr.push(onReady);
    }
  }

  set onDownloadProgress(onDownloadProgress: onDownloadProgress) {
    this.onDownloadProgressArr.push(onDownloadProgress);
  }

  constructor(stateSave: SimulationStateSave) {
    this.simulation = null;
    this.init(stateSave)
      .then(simulation => {
        this.simulation = simulation;
        this.handleOnReady(simulation);
      })
      .catch(e => this.logger.error(`SimulationBuilder: Failed to initialize a  simulation: ${String(e)}`));
  }

  private async init(stateSave: SimulationStateSave) {
    const sim = new Simulation(stateSave);
    sim.logger.log('Simulation instance created');

    sim.scene.useRightHandedSystem = stateSave?.leftHandedSystem === undefined ? true : !stateSave.leftHandedSystem;
    sim.initPhysics(stateSave?.gravity);

    if (stateSave.table) {
      try {
        await sim.tableFromState(stateSave.table);
      } catch (e) {
        sim.logger.error(`Failed to load table: ${String(e)}`);
      }
    }

    this.downloadProgress.total = (stateSave?.actorStates ?? []).length;
    await Promise.all(
      (stateSave?.actorStates ?? []).map(async actorState => {
        const actor = await sim
          .actorFromState(actorState)
          .catch(e => this.logger.error(`Failed to load actor ${actorState.guid}: ${String(e)}`));
        if (actor) {
          this.downloadProgress.succeeded++;
        } else {
          this.downloadProgress.failed++;
        }
        this.downloadProgress.loaded++;
        this.handleOnDownloadProgress();
      }),
    );
    return sim;
  }

  private handleOnReady(simulation: Simulation) {
    this.onReadyArr.forEach(onReady => {
      onReady(simulation, this.downloadProgress);
    });
  }

  private handleOnDownloadProgress() {
    this.onDownloadProgressArr.forEach(onDownloadProgress => {
      onDownloadProgress(this.downloadProgress);
    });
  }
}
