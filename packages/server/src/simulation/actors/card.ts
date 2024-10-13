import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { CardMixin } from '@tt/actors';
import { Loader } from '@tt/loader';
import type { CardState } from '@tt/states';
import type { Constructor } from '@tt/utils';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

class CardBase extends ServerBase<CardState> {
  constructor(state: CardState, model: Mesh) {
    super(state, model);
  }
}

export class Card extends CardMixin<Constructor<ServerBase<CardState>>>(CardBase) {
  static async fromState(state: CardState): Promise<Card | null> {
    const model = await Loader.loadMesh(AssetsManager.CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    return new this(state, model);
  }
}
