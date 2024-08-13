import { NullEngine } from '@babylonjs/core/Engines/nullEngine';

import type { Tuple } from '@babylonjs/core';
import { HavokPlugin, Vector3 } from '@babylonjs/core';
import '@babylonjs/core/Helpers'; // createDefaultCameraOrLight
import { Logger } from '@nestjs/common';
import type { TableState } from '@shared/dto/states';
import { type SimulationStateSave } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import { SharedBase, SimulationBase } from '@shared/playground';
import { isContainable } from '@shared/playground/actions/Containable';
import { SimulationSceneBase } from '@shared/playground/Simulation/SimulationSceneBase';
import type { WS } from '@shared/ws';
import { ClientAction, ServerAction } from '@shared/ws';
import type { ClientActionMsg, ServerActionMsg } from '@shared/ws/ws';
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

  update(msg: ClientActionMsg[]) {
    msg.map(msg => this.handleAction(msg));
  }

  handleAction(msg: ClientActionMsg) {
    switch (msg.type) {
      case ClientAction.PICK_ACTOR:
        this.handlePickActor(msg.payload);
        break;
      case ClientAction.RELEASE_ACTOR:
        this.handleReleaseActor(msg.payload);
        break;
      case ClientAction.MOVE_ACTOR:
        this.handleMoveActor(msg.payload.guid, msg.payload.position);
        break;
      case ClientAction.PICK_ITEM:
        this.handlePickItem(msg.payload);
        break;
    }
  }

  handlePickItem(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && isContainable(actor)) {
      actor.pickItem();
    }
  }

  handlePickActor(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) {
      actor.pick();
    }
  }

  handleReleaseActor(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) {
      actor.release();
    }
  }

  handleMoveActor(guid: string, position: Tuple<number, 2>) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) {
      actor.move(...position);
    }
  }

  static async actorFromState(actorState: UnknownActorState): Promise<ServerBase | null> {
    return await this.actorBuilder.build(actorState);
  }

  static async tableFromState(tableState: TableState): Promise<ServerBase | null> {
    return await this.actorBuilder.buildTable(tableState);
  }

  getSimActions(prevState: SimulationStateSave, state: SimulationStateSave): ServerActionMsg[] {
    const actions: WS.ServerActionMsg[] = [];

    const prevActorStates = prevState.actorStates ?? [];
    const actorStates = state.actorStates ?? [];

    const guids = new Set([
      ...prevActorStates.map(actorState => actorState.guid),
      ...actorStates.map(actorState => actorState.guid),
    ]);

    guids.forEach(guid => {
      const actorState = state.actorStates?.find(actorState => actorState.guid === guid);
      const prevActorState = prevState.actorStates?.find(actorState => actorState.guid === guid);
      if (!actorState && !prevActorState) return;

      if (!actorState && prevActorState) {
        // handle remove actor
        return;
      }
      if (!prevActorState && actorState) {
        actions.push({
          type: ServerAction.SPAWN_ACTOR,
          payload: actorState,
        });
        return;
      }

      if (prevActorState && actorState) {
        const positionUpdate = SharedBase.prototype.getPositionUpdate(prevActorState, actorState);
        if (positionUpdate) {
          actions.push({
            type: ServerAction.MOVE_ACTOR,
            payload: { guid: guid, position: positionUpdate },
          });
        }
      }
    });

    return actions;
  }

  toState(): SimulationStateSave {
    return {
      ...this.initialState,
      actorStates: this.actors.map(actor => actor.toState()),
    };
  }
}
