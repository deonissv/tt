import { Loader } from '@tt/loader';
import { containerSize } from '@tt/rules';
import type { DeckState } from '@tt/states';
import { pickItem, shuffle } from '../behaviors/container';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class Deck extends ServerBase<DeckState> {
  get size(): number {
    return containerSize(this.toState()) ?? 0;
  }

  static async fromState(state: DeckState): Promise<Deck | null> {
    const model = await Loader.loadMesh(AssetsManager.CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    model.scaling.y = state.cards.length;

    return new this(state, model);
  }

  async pickItem(clientId: string, pickHeight: number): Promise<ServerBase | null> {
    return pickItem(this, clientId, pickHeight);
  }

  shuffle() {
    shuffle(this);
  }
}
