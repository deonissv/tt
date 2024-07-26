import type { Mesh } from '@babylonjs/core';
import type { TileState } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import type { Containable } from '../actions/Containable';
import { ActorBase } from './ActorBase';
import { Tile } from './Tile';

const TILE_MASS = 1;

export class TileStack extends ActorBase implements Containable {
  declare __state: TileStackState;
  size: number;

  constructor(state: TileStackState, model: Mesh) {
    super(state.guid, state.name, model, undefined, state.transformation, TILE_MASS * state.size, undefined, state);

    this.size = state.size;
    model.scaling.x = this.size;
  }

  static override async fromState(state: TileStackState): Promise<TileStack | null> {
    const tileModel = await Tile.getTileModel(state.tileType, state.faceURL, state.backURL);
    if (!tileModel) {
      return null;
    }

    return new TileStack(state, tileModel);
  }

  override toState() {
    return {
      ...super.toState(),
      size: this.size,
    };
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
