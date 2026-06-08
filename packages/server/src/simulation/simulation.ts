import { NullEngine } from '@babylonjs/core/Engines/nullEngine';

import { HavokPlugin, Vector3 } from '@babylonjs/core';
import '@babylonjs/core/Helpers'; // createDefaultCameraOrLight
import { Logger } from '@nestjs/common';
import { SimulationBase, SimulationSceneBase } from '@tt/simulation';
import type { TableState, UnknownActorState } from '@tt/states';
import { type SimulationStateSave } from '@tt/states';
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
    this.scene.useRightHandedSystem =
      initialState?.leftHandedSystem === undefined ? true : !initialState.leftHandedSystem;
    this.scene.createDefaultCameraOrLight(false, false, false);
    this.logger = new Logger(Simulation.name);
  }

  get actors(): ServerBase[] {
    return this.scene.actors as unknown as ServerBase[];
  }

  initPhysics(gravity?: number) {
    const hk = new HavokPlugin(true, global.havok);
    const gravityVec = gravity ? new Vector3(0, -gravity, 0) : undefined;

    hk.setVelocityLimits(50, 200);
    this.scene.enablePhysics(gravityVec, hk);
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
