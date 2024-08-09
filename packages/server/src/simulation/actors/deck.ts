import type { Mesh, Texture } from '@babylonjs/core';
import type { CardState, DeckState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { DeckMixin } from '@shared/playground/actors/DeckMixin';
import type { Constructor } from '@shared/types';
import { Card } from './card';
import { ServerActor } from './serverActor';

export class Deck extends DeckMixin(ServerActor) {
  constructor(state: DeckState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const items = state.cards;

    super(state, model);

    this.items = items;
    this.renderDeck(faceTexture, backTexture);
  }

  static async fromState<T extends Deck>(this: Constructor<T>, state: DeckState): Promise<T | null> {
    const model = await Card.loadCardModel();

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(state.cards.at(-1)!.faceURL);
    const backTexture = await Loader.loadTexture(state.cards.at(0)!.backURL);

    if (!faceTexture || !backTexture) {
      return null;
    }

    return new this(state, model, faceTexture, backTexture);
  }

  override async pickItem(): Promise<ServerActor<CardState> | null> {
    this.model.scaling.x -= 1;

    if (this.size < 1) {
      return null;
    }
    const isFipped = true;
    const cardState = isFipped ? this.items.pop()! : this.items.shift()!;

    cardState.transformation = this.transformation;
    cardState.transformation.position![0] -= 4;

    const newCard = await Card.fromState<Card>(cardState);

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
