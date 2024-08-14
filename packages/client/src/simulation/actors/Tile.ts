import type { TileState } from '@shared/dto/states';
import { TileMixin } from '@shared/playground/actors/TileMixin';
import { ClientBase } from './ClientBase';

export class Tile extends TileMixin(ClientBase) {
  static async fromState(state: TileState): Promise<Tile | null> {
    const tileModel = await Tile.getTileModel(state.tileType, state.faceURL, state.backURL);
    if (!tileModel) {
      return null;
    }

    return new this(state, tileModel);
  }
}
