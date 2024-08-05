import { NullEngine } from '@babylonjs/core/Engines/nullEngine';

import '@babylonjs/core/Helpers'; // createDefaultCameraOrLight
import { Logger } from '@nestjs/common';
import type {
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
  TileState,
} from '@shared/dto/states';
import {
  ActorType,
  type ActorBaseState,
  type ActorStateUpdate,
  type SimulationStateSave,
  type SimulationStateUpdate,
  type TableState,
} from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import { SimulationBase } from '@shared/playground';
import { SimulationSceneBase } from '@shared/playground/Simulation/SimulationSceneBase';
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

  private constructor(initialState: SimulationStateSave) {
    super();
    this.engine = new NullEngine();
    this.scene = new SimulationSceneBase(this.engine);
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
    sim.logger.log('Simulation actors created');

    return sim;
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
