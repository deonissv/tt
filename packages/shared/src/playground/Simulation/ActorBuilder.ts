import type { ActorState, TableState, TileState } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import type { SharedBase } from '../actors';

export abstract class ActorBuilder {
  abstract build(actorState: UnknownActorState): Promise<SharedBase | null>;
  abstract buildTable(tableState: TableState): Promise<SharedBase<ActorState> | null>;

  abstract buildTile(tileState: TileState): Promise<SharedBase<TileState> | null>;
}
