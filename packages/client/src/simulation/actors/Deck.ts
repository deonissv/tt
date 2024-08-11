import type { Mesh, Texture } from '@babylonjs/core';
import type { DeckState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { DeckMixin } from '@shared/playground/actors/DeckMixin';
import { Card } from './Card';
import { ClientBase } from './ClientBase';

export class Deck extends DeckMixin(ClientBase) {
  constructor(state: DeckState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const items = state.cards;

    super(state, model);

    this.items = items;
    this.renderDeck(faceTexture, backTexture);
  }

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

  renderDeck(faceTexture: Texture, backTexture: Texture) {
    if (this.items.length === 0) {
      this.setEnabled(false);
    }

    const cardModel = Card.getCardModel(this.model, faceTexture, backTexture, this.items.at(-1)!);
    this.__model = cardModel;
    this.model.scaling.x = this.size;
  }
}
