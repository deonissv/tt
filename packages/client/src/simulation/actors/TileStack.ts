import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { TileStackState, TileState } from '@tt/states';
import { ActorType } from '@tt/states';
import { ClientBase } from './ClientBase';
import { Tile } from './Tile';

export class TileStack extends ClientBase<TileStackState> {
  constructor(state: TileStackState, model: Mesh) {
    model.scaling.y = state.size;
    super(state, model);
  }

  get size(): number {
    return this.__state.size;
  }

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
    const size = this.size - 1;
    this.updateState({ guid: this.guid, size });
    this.model.scaling.y = size;

    return newTile;
  }
}
