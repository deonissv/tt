import type { TileState } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import { TileStackMixin } from '@shared/playground/actors/TileStackMixin';
import { ClientBase } from './ClientBase';
import { Tile } from './Tile';

export class TileStack extends TileStackMixin(ClientBase<TileStackState>) {
  static async fromState(state: TileStackState): Promise<TileStack | null> {
    const tileModel = await Tile.getTileModel(state.tileType, state.faceURL, state.backURL);
    if (!tileModel) {
      return null;
    }

    return new TileStack(state, tileModel);
  }

  async pickItem(): Promise<Tile | null> {
    this.model.scaling.y -= 1;

    if (this.size < 1) {
      return null;
    }

    const tileState: TileState = {
      ...this.__state,
      type: ActorType.TILE,
    };

    tileState.transformation!.position![0] -= 4;
    const newTile = await Tile.fromState(tileState);
    this.size -= 1;
    this.model.scaling.y = this.size;

    return newTile;
  }
}
