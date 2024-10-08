import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { CardState } from '@shared/dto/states';
import { CardMixin } from '@shared/playground/actors/CardMixin';
import type { Constructor } from '@shared/types';
import { ServerBase } from './serverBase';

class CardBase extends ServerBase<CardState> {
  constructor(state: CardState, model: Mesh) {
    super(state, model);
  }
}

export class Card extends CardMixin<Constructor<ServerBase<CardState>>>(CardBase) {
  static async fromState(state: CardState): Promise<Card | null> {
    const model = await Card.loadCardModel();

    if (!model) {
      return null;
    }

    return new this(state, model);
  }
}
