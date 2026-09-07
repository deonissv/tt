import { Loader } from '@tt/loader';
import { containerSize } from '@tt/rules';
import type { BagState } from '@tt/states';
import { pickItem, shuffle } from '../behaviors/container';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class Bag extends ServerBase<BagState> {
  get size(): number {
    return containerSize(this.toState()) ?? 0;
  }

  async pickItem(clientId: string, pickHeight: number): Promise<ServerBase | null> {
    return pickItem(this, clientId, pickHeight);
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
    shuffle(this);
  }
}
