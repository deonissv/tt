import { HavokPlugin, PhysicsEventType, Vector3 } from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';
import { Simulation as ClientSimulation } from '@client/src/simulation';
import type { ClientBase } from '@client/src/simulation/actors';
import type { ServerActor } from '@server/src/simulation/actors';
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
} from '@server/src/simulation/actors';
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
  TableState,
  TileState,
} from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';

export class Simulation extends ClientSimulation {
  async initPhysics(gravity?: number) {
    const hk = new HavokPlugin(true, await HavokPhysics());
    const gravityVector = gravity ? new Vector3(0, -gravity, 0) : undefined;
    this.scene.enablePhysics(gravityVector, hk);
    hk.onTriggerCollisionObservable.add(ev => {
      if (ev.type === PhysicsEventType.TRIGGER_ENTERED) {
        const tn1 = ev.collider.transformNode;
        const tn2 = ev.collidedAgainst.transformNode;
        if (tn1.name !== 'ground' && tn2.name !== 'ground') {
          const [actor, c] = tn1.picked ? [tn1, tn2] : [tn2, tn1];
          actor.preventCollide(c);
        }
      }
    });
  }

  static override async actorFromState(actorState: ActorBaseState): Promise<ServerActor | null> {
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

  static override async tableFromState(tableState: TableState): Promise<ClientBase | null> {
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
}
