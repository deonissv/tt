import type { Texture } from '@babylonjs/core';
import type { DeckState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { DeckMixin } from '@shared/playground/actors/DeckMixin';
import { Card } from './Card';
import { ClientBase } from './ClientBase';

export class Deck extends DeckMixin(ClientBase) {
  static async fromState(state: DeckState): Promise<Deck | null> {
    const model = await Card.loadCardModel();

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(state.cards.at(-1)!.faceURL);
    const backTexture = await Loader.loadTexture(state.cards.at(0)!.backURL);

    if (!faceTexture || !backTexture) {
      return null;
    }

    return new Deck(state, model, faceTexture, backTexture);
  }

  async pickItem() {
    this.model.scaling.x -= 1;

    if (this.size < 1) {
      return null;
    }
    const isFipped = true;
    const cardState = isFipped ? this.items.pop()! : this.items.shift()!;

    cardState.transformation = this.transformation;
    cardState.transformation.position![0] -= 4;

    const newCard = await Card.fromState(cardState);

    const faceTexture = await Loader.loadTexture(this.items.at(-1)!.faceURL);
    const backTexture = await Loader.loadTexture(this.items.at(0)!.backURL);

    if (!faceTexture || !backTexture) {
      return null;
    }

    this.renderDeck(faceTexture, backTexture);
    return newCard;
  }

  renderDeck(faceTexture: Texture, backTexture: Texture) {
    if (this.items.length === 0) {
      this.setEnabled(false);
    }

    const cardModel = Card.getCardModel(this.model, faceTexture, backTexture, this.items.at(-1)!);
    this.__model = cardModel;
    this.model.scaling.x = this.size;
  }
}
