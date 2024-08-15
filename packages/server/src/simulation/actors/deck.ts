import type { Mesh } from '@babylonjs/core';
import type { CardState, DeckState } from '@shared/dto/states';
import type { Containable } from '@shared/playground/actions/Containable';
import { DeckMixin } from '@shared/playground/actors/DeckMixin';
import { ServerActorBuilder } from '../serverActorBuilder';
import { Card } from './card';
import { ServerBase } from './serverBase';

export class Deck extends DeckMixin(ServerBase) implements Containable {
  constructor(state: DeckState, model: Mesh) {
    const items = state.cards;

    super(state, model);

    this.items = items;
  }

  static async fromState(state: DeckState): Promise<Deck | null> {
    const model = await Card.loadCardModel();

    if (!model) {
      return null;
    }

    return new this(state, model);
  }

  async pickItem(clientId: string): Promise<ServerBase<CardState> | null> {
    this.model.scaling.y -= 1;

    if (this.size < 1) {
      return null;
    }
    const isFipped = true;
    const cardState = isFipped ? this.items.pop()! : this.items.shift()!;

    cardState.transformation = this.transformation;
    cardState.transformation.position![1] += 1;

    const newCard = await ServerActorBuilder.buildCard(cardState);
    newCard?.pick(clientId);

    return newCard;
  }
}
