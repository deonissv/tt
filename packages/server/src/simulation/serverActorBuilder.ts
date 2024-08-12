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
  TableState,
  TileState,
} from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import { ActorBuilder } from '@shared/playground/Simulation/ActorBuilder';
import type { ServerBase } from './actors';
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

export class ServerActorBuilderFactory extends ActorBuilder {
  async build(actorState: UnknownActorState): Promise<ServerBase | null> {
    switch (actorState.type) {
      case ActorType.ACTOR:
        return await this.buildActor(actorState);
      case ActorType.BAG:
        return await this.buildBag(actorState);
      case ActorType.CARD:
        return await this.buildCard(actorState);
      case ActorType.DECK:
        return await this.buildDeck(actorState);
      case ActorType.DIE4:
        return await this.buildDie4(actorState);
      case ActorType.DIE6:
        return await this.buildDie6(actorState);
      case ActorType.DIE8:
        return await this.buildDie8(actorState);
      case ActorType.DIE10:
        return await this.buildDie10(actorState);
      case ActorType.DIE12:
        return await this.buildDie12(actorState);
      case ActorType.DIE20:
        return await this.buildDie20(actorState);
      case ActorType.TILE:
        return await this.buildTile(actorState);
      case ActorType.TILE_STACK:
        return await this.buildTileStack(actorState);
    }
  }

  async buildTable(tableState: TableState): Promise<ServerBase | null> {
    switch (tableState.type) {
      case 'Hexagon':
        return await HexTable.fromState<HexTable>();
      case 'Circle':
        return await CircleTable.fromState<CircleTable>();
      case 'CircleGlass':
        return await GlassTable.fromState<GlassTable>();
      case 'Square':
        return await SquareTable.fromState<SquareTable>();
      case 'CustomRectangle':
        return await CustomRectangleTable.fromState(tableState);
      case 'Octagon':
        return await OctagonTable.fromState();
      case 'CustomSquare':
        return await CustomSquareTable.fromState<CustomSquareTable>(tableState);
      case 'Rectangle':
        return await RectangleTable.fromState<RectangleTable>();
      case 'Poker':
        return await PokerTable.fromState<PokerTable>();
    }
  }

  async buildActor(actorState: ActorState): Promise<Actor | null> {
    return await Actor.fromState(actorState);
  }

  async buildBag(actorState: BagState): Promise<Bag | null> {
    return await Bag.fromState(actorState);
  }

  async buildCard(actorState: CardState): Promise<Card | null> {
    return await Card.fromState(actorState);
  }

  async buildDeck(actorState: DeckState): Promise<Deck | null> {
    return await Deck.fromState(actorState);
  }

  async buildDie4(actorState: Die4State): Promise<Die4 | null> {
    return await Die4.fromState(actorState);
  }

  async buildDie6(actorState: Die6State): Promise<Die6 | null> {
    return await Die6.fromState(actorState);
  }

  async buildDie8(actorState: Die8State): Promise<Die8 | null> {
    return await Die8.fromState(actorState);
  }

  async buildDie10(actorState: Die10State): Promise<Die10 | null> {
    return await Die10.fromState(actorState);
  }

  async buildDie12(actorState: Die12State): Promise<Die12 | null> {
    return await Die12.fromState(actorState);
  }

  async buildDie20(actorState: Die20State): Promise<Die20 | null> {
    return await Die20.fromState(actorState);
  }

  async buildTile(actorState: TileState): Promise<Tile | null> {
    return await Tile.fromState(actorState);
  }

  async buildTileStack(actorState: TileStackState): Promise<TileStack | null> {
    return await TileStack.fromState(actorState);
  }
}

export const ServerActorBuilder = new ServerActorBuilderFactory();
