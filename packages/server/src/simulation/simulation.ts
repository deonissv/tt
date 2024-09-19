import { NullEngine } from '@babylonjs/core/Engines/nullEngine';

import { HavokPlugin, Vector3 } from '@babylonjs/core';
import '@babylonjs/core/Helpers'; // createDefaultCameraOrLight
import { Logger } from '@nestjs/common';
import type { TableState } from '@shared/dto/states';
import { type SimulationStateSave } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import { SimulationBase } from '@shared/playground';
import { SimulationSceneBase } from '@shared/playground/Simulation/SimulationSceneBase';
import type { ServerBase } from './actors';
import { ServerActorBuilder } from './serverActorBuilder';

export class Simulation extends SimulationBase {
  static actorBuilder = ServerActorBuilder;
  logger: Logger;

  constructor(initialState: SimulationStateSave) {
    super();
    this.engine = new NullEngine();
    this.scene = new SimulationSceneBase(this.engine);
    this.initialState = initialState;
    this.scene.createDefaultCameraOrLight(false, false, false);
    this.logger = new Logger(Simulation.name);
  }

  get actors(): ServerBase[] {
    return this.scene.actors as ServerBase[];
  }

  initPhysics(gravity?: number) {
    const hk = new HavokPlugin(true, global.havok);
    const gravityVec = gravity ? new Vector3(0, -gravity, 0) : undefined;

    hk.setVelocityLimits(50, 200);
    this.scene.enablePhysics(gravityVec, hk);
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
    sim.initPhysics(stateSave?.gravity);

    if (stateSave.table) {
      try {
        await this.tableFromState(stateSave.table);
      } catch (e) {
        sim.logger.error(`Failed to load table: ${String(e)}`);
      }
    }

    await Promise.all(
      (stateSave?.actorStates ?? []).map(async actorState => {
        try {
          const actor = await this.actorFromState(actorState);
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

  static async actorFromState(actorState: UnknownActorState): Promise<ServerBase | null> {
    return await this.actorBuilder.build(actorState);
  }

  static async tableFromState(tableState: TableState): Promise<ServerBase | null> {
    return await this.actorBuilder.buildTable(tableState);
  }

  toState(): SimulationStateSave {
    return {
      ...this.initialState,
      actorStates: this.actors.map(actor => actor.toState() as UnknownActorState),
    };
  }
}
