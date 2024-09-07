import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { CardState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { CardMixin } from '@shared/playground/actors/CardMixin';
import { ClientBase } from './ClientBase';

class CardBase extends CardMixin(ClientBase<CardState>) {}

export class Card extends CardBase {
  constructor(state: CardState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const cardModel = CardBase.getCardModel(model, faceTexture, backTexture, state);
    super(state, cardModel);
  }

  static async fromState(state: CardState): Promise<Card | null> {
    const model = await Card.loadCardModel();

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(state.faceURL);
    const backTexture = await Loader.loadTexture(state.backURL);

    if (!faceTexture || !backTexture) {
      return null;
    }

    return new Card(state, model, faceTexture, backTexture);
  }
}
