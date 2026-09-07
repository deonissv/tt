import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Loader } from '@tt/loader';
import { containerSize } from '@tt/rules';
import type { TileStackState } from '@tt/states';
import { pickItem } from '../behaviors/container';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class TileStack extends ServerBase<TileStackState> {
  constructor(state: TileStackState, modelMesh: Mesh, colliderMesh?: Mesh) {
    modelMesh.scaling.y = state.size;

    if (colliderMesh) {
      colliderMesh.scaling.y = state.size;
    }

    super(state, modelMesh, colliderMesh);
  }

  get size(): number {
    return containerSize(this.toState()) ?? 0;
  }

  async pickItem(clientId: string, pickHeight: number): Promise<ServerBase | null> {
    return pickItem(this, clientId, pickHeight);
  }

  static async fromState(state: TileStackState): Promise<TileStack | null> {
    const tileModel = await Loader.loadMesh(AssetsManager.getTileMesh(state.tileType));

    if (!tileModel) {
      return null;
    }

    return new TileStack(state, tileModel);
  }
}
