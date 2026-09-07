import { Loader } from '@tt/loader';
import type { BagState, Model } from '@tt/states';
import { AssetsManager } from './AssetsManages';
import { ClientBase } from './ClientBase';

export class Bag extends ClientBase<BagState> {
  static async fromState(state: BagState): Promise<Bag | null> {
    const modelState: Model = state.model ?? AssetsManager.BAG_MODEL;
    const [model, collider] = await Loader.loadModel(modelState);

    if (!model) {
      return null;
    }

    return new this(state, model, collider ?? undefined);
  }
}
