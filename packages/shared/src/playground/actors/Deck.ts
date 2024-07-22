import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';

import type { CardState, DeckState } from '@shared/dto/states';
import type { Containable } from '../actions/Containable';
import { Loader } from '../Loader';
import { ActorBase } from './ActorBase';
import { Card } from './Card';

const CARD_MASS = 1;

export class Deck extends ActorBase implements Containable {
  declare __state: DeckState;
  items: CardState[];

  constructor(state: DeckState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const items = state.cards;

    super(state.guid, state.name, model, undefined, state.transformation, CARD_MASS * items.length, undefined, state);

    this.items = items;
    this.renderDeck(faceTexture, backTexture);
  }

  get size() {
    return this.items.length;
  }

  renderDeck(faceTexture: Texture, backTexture: Texture) {
    if (this.items.length === 0) {
      this.setEnabled(false);
    }

    const cardModel = Card.getCardModel(this.model, faceTexture, backTexture, this.items.at(-1)!);
    this.__model = cardModel;
    this.model.scaling.x = this.size;
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

  override toState() {
    return {
      ...super.toState(),
      cards: this.items,
    };
  }

  async pickItem() {
    this.model.scaling.x -= 1;

    if (this.size < 1) {
      return;
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
}
