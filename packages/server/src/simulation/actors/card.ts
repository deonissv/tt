import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { CardState } from '@shared/dto/states';
import { CardMixin } from '@shared/playground/actors/CardMixin';
import type { Constructor } from '@shared/types';
import { ServerActor } from './serverActor';

class CardBase extends ServerActor<CardState> {
  constructor(state: CardState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const cardModel = Card.getCardModel(model, faceTexture, backTexture, state);
    super(state, cardModel);
  }
}

export class Card extends CardMixin<Constructor<ServerActor<CardState>>>(CardBase) {}
