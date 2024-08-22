import type { TileState } from '@shared/dto/states';
import { TileMixin } from '@shared/playground/actors/TileMixin';
import { ServerBase } from './serverBase';

export class Tile extends TileMixin(ServerBase<TileState>) {
  static async fromState(state: TileState): Promise<Tile | null> {
    const tileModel = await this.getTileMesh(state.tileType);
    if (!tileModel) {
      return null;
    }

    return new this(state, tileModel);
  }
}
