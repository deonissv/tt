import type { Mesh, Texture } from '@babylonjs/core';
import type { CardState } from '@shared/dto/states';
import { CardMixin } from '@shared/playground/actors/CardMixin';
import { ServerActor } from './serverActor';

class CardBase extends CardMixin(ServerActor<CardState>) {}

export class Card extends CardBase {
  constructor(state: CardState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const cardModel = CardBase.getCardModel(model, faceTexture, backTexture, state);
    super(state, cardModel);
  }
}
