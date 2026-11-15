import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Loader } from '@tt/loader';
import { containerSize } from '@tt/rules';
import { ActorType, type TileState, type TileStackState } from '@tt/states';
import { spawnDrawnItem } from '../behaviors/container';
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
    const state = this.toState();
    if (state.size < 2) return null;
    const { size: _size, ...tileData } = structuredClone(state);
    const child: TileState = { ...tileData, type: ActorType.TILE };
    this.setSize(state.size - 1);
    return spawnDrawnItem(this, child, clientId, pickHeight, () => {
      // Restore this reservation without undoing other completed draws.
      this.setSize(this.toState().size + 1);
    });
  }

  private setSize(size: number): void {
    this.updateState({ guid: this.guid, size });
    this.model.scaling.y = size;
    this.__collider.scaling.y = size;
    this._forceUpdate();
  }

  static async fromState(state: TileStackState): Promise<TileStack | null> {
    const tileModel = await Loader.loadMesh(AssetsManager.getTileMesh(state.tileType));

    if (!tileModel) {
      return null;
    }

    return new TileStack(state, tileModel);
  }
}
