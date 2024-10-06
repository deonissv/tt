import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TileStackMixin } from '@shared/playground/actors/TileStackMixin';
import { Loader } from '@tt/loader';
import type { TileStackState, TileState } from '@tt/states';
import { ActorType } from '@tt/states';
import { ServerActorBuilder } from '../serverActorBuilder';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';
import type { Tile } from './tile';

export class TileStack extends TileStackMixin(ServerBase<TileStackState>) {
  size: number;

  constructor(state: TileStackState, modelMesh: Mesh, colliderMesh?: Mesh) {
    modelMesh.scaling.y = state.size;

    if (colliderMesh) {
      colliderMesh.scaling.y = state.size;
    }

    super(state, modelMesh, colliderMesh);
    this.size = state.size;
  }

  async pickItem(clientId: string, pickHeight: number): Promise<Tile | null> {
    if (this.size < 2) {
      return null;
    }

    const tileState = {
      ...this.__state,
      guid: this.scene.getUniqueGUID(),
      type: ActorType.TILE,
      transformation: this.transformation,
    } satisfies TileState;

    tileState.transformation.position[1] += 1;
    tileState.transformation.scale[1] /= this.size;

    const newTile = await ServerActorBuilder.buildTile(tileState);

    newTile?.pick(clientId, pickHeight);

    this.size -= 1;

    this.model.scaling.y = this.size;
    if (this.__collider) {
      this.__collider.scaling.y = this.size;
      this._forceUpdate();
    }

    return newTile;
  }

  static async fromState(state: TileStackState): Promise<TileStack | null> {
    const tileModel = await Loader.loadMesh(AssetsManager.getTileMesh(state.tileType));

    if (!tileModel) {
      return null;
    }

    return new TileStack(state, tileModel);
  }
}
