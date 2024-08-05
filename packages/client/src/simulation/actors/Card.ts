import type { Mesh, Texture } from '@babylonjs/core';
import type { CardState } from '@shared/dto/states';
import { CardMixin } from '@shared/playground/actors/CardMixin';
import { ClientBase } from './ClientBase';

class CardBase extends CardMixin(ClientBase<CardState>) {}

export class Card extends CardBase {
  constructor(state: CardState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const cardModel = CardBase.getCardModel(model, faceTexture, backTexture, state);
    super(state, cardModel);
  }
}
