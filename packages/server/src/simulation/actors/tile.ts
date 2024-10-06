import type { TileState } from '@tt/states';
import { Loader } from '@shared/playground';
import { TileMixin } from '@shared/playground/actors/TileMixin';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class Tile extends TileMixin(ServerBase<TileState>) {
  static async fromState(state: TileState): Promise<Tile | null> {
    const tileModel = await Loader.loadMesh(AssetsManager.getTileMesh(state.tileType));
    if (!tileModel) {
      return null;
    }

    return new this(state, tileModel);
  }
}
