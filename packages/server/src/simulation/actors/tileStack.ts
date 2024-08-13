import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { TileState } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import { TileStackMixin } from '@shared/playground/actors/TileStackMixin';
import { ServerActorBuilder } from '../serverActorBuilder';
import { ServerBase } from './serverBase';
import { Tile } from './tile';

export class TileStack extends TileStackMixin(ServerBase<TileStackState>) {
  size: number;

  constructor(state: TileStackState, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);
    this.size = state.size;
  }

  async pickItem(): Promise<Tile | null> {
    this.model.scaling.y -= 1;

    if (this.size < 1) {
      return null;
    }

    const tileState: TileState = {
      ...this.__state,
      type: ActorType.TILE,
      transformation: this.transformation,
    };

    tileState.transformation!.position![0] -= 4;

    const newTile = await ServerActorBuilder.buildTile(tileState);
    this.size -= 1;
    this.model.scaling.y = this.size;

    return newTile;
  }

  static async fromState(state: TileStackState): Promise<TileStack | null> {
    const tileModel = await Tile.getTileModel(state.tileType, state.faceURL, state.backURL);
    if (!tileModel) {
      return null;
    }

    return new TileStack(state, tileModel);
  }
}
