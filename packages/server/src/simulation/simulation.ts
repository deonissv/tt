import { NullEngine } from '@babylonjs/core/Engines/nullEngine';

import type { Tuple } from '@babylonjs/core';
import { HavokPlugin, Vector3 } from '@babylonjs/core';
import '@babylonjs/core/Helpers'; // createDefaultCameraOrLight
import { Logger } from '@nestjs/common';
import type {
  ActorBaseState,
  ActorState,
  BagState,
  CardState,
  DeckState,
  Die10State,
  Die12State,
  Die20State,
  Die4State,
  Die6State,
  Die8State,
  SimulationStateUpdate,
  TableState,
  TileState,
} from '@shared/dto/states';
import { ActorType, type SimulationStateSave } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import { isTuple } from '@shared/guards';
import { SimulationBase } from '@shared/playground';
import { SimulationSceneBase } from '@shared/playground/Simulation/SimulationSceneBase';
import type { WS } from '@shared/ws';
import { ClientAction, ServerAction } from '@shared/ws';
import type { ClientActionMsg, ServerActionMsg } from '@shared/ws/ws';
import type { ServerActor } from './actors';
import {
  Actor,
  Bag,
  Card,
  CircleTable,
  CustomRectangleTable,
  CustomSquareTable,
  Deck,
  Die10,
  Die12,
  Die20,
  Die4,
  Die6,
  Die8,
  GlassTable,
  HexTable,
  OctagonTable,
  PokerTable,
  RectangleTable,
  SquareTable,
  Tile,
  TileStack,
} from './actors';

export class Simulation extends SimulationBase {
  logger: Logger;

  constructor(initialState: SimulationStateSave) {
    super();
    this.engine = new NullEngine();
    this.scene = new SimulationSceneBase(this.engine);
    this.initialState = initialState;
    this.scene.createDefaultCameraOrLight(false, false, false);
    this.logger = new Logger(Simulation.name);
  }

  get actors(): ServerActor[] {
    return this.scene.actors as ServerActor[];
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

  static async actorFromState(actorState: ActorBaseState): Promise<ServerActor | null> {
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

  static async tableFromState(tableState: TableState): Promise<ServerActor | null> {
    switch (tableState.type) {
      case 'Hexagon':
        return await HexTable.fromState();
      case 'Circle':
        return await CircleTable.fromState();
      case 'CircleGlass':
        return await GlassTable.fromState();
      case 'Square':
        return await SquareTable.fromState();
      case 'CustomRectangle':
        return await CustomRectangleTable.fromState(tableState);
      case 'Octagon':
        return await OctagonTable.fromState();
      case 'CustomSquare':
        return await CustomSquareTable.fromState(tableState);
      case 'Rectangle':
        return await RectangleTable.fromState();
      case 'Poker':
        return await PokerTable.fromState();
      case null:
        return null;
    }
  }

  getSimActions(simStateUpdate: SimulationStateUpdate): ServerActionMsg[] {
    const actions: WS.ServerActionMsg[] = [];

    simStateUpdate.actorStates?.forEach(actorState => {
      if (actorState.transformation?.position && isTuple(actorState.transformation.position, 3))
        actions.push({
          type: ServerAction.MOVE_ACTOR,
          payload: { guid: actorState.guid, position: actorState.transformation.position },
        });
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
