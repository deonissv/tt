import { Loader } from '@tt/loader';
import { containerSize } from '@tt/rules';
import type { BagState } from '@tt/states';
import { shuffle as shuffleItems } from '@tt/utils';
import { spawnDrawnItem } from '../behaviors/container';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class Bag extends ServerBase<BagState> {
  get size(): number {
    return containerSize(this.toState()) ?? 0;
  }

  async pickItem(clientId: string, pickHeight: number): Promise<ServerBase | null> {
    const state = this.toState();
    if (state.containedObjects.length < 1) return null;
    const child = structuredClone(state.containedObjects.at(-1)!);
    this.updateState({ guid: state.guid, containedObjects: structuredClone(state.containedObjects.slice(0, -1)) });
    return spawnDrawnItem(this, child, clientId, pickHeight);
  }

  static async fromState(state: BagState): Promise<Bag | null> {
    const colliderURL = state.model
      ? (state.model.colliderURL ?? state.model.meshURL)
      : AssetsManager.BAG_MODEL.colliderURL;

    const model = await Loader.loadMesh(colliderURL);

    if (!model) {
      return null;
    }

    return new this(state, model);
  }

  shuffle() {
    const containedObjects = structuredClone(this.toState().containedObjects);
    shuffleItems(containedObjects);
    this.updateState({ guid: this.guid, containedObjects });
  }
}
