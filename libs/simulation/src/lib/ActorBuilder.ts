import type { SharedBase } from '@tt/actors';
import type { TableState, TileState, UnknownActorState } from '@tt/states';

export abstract class ActorBuilder {
  abstract build(actorState: UnknownActorState): Promise<SharedBase | null>;
  abstract buildTable(tableState: TableState): Promise<SharedBase | null>;

  abstract buildTile(tileState: TileState): Promise<SharedBase<TileState> | null>;
}
