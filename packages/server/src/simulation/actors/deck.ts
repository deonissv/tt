import type { Mesh } from '@babylonjs/core';
import type { CardState, DeckState } from '@shared/dto/states';
import { DeckMixin } from '@shared/playground/actors/DeckMixin';
import type { Constructor } from '@shared/types';
import { ServerActorBuilder } from '../serverActorBuilder';
import { Card } from './card';
import { ServerBase } from './serverBase';

export class Deck extends DeckMixin(ServerBase) {
  constructor(state: DeckState, model: Mesh) {
    const items = state.cards;

    super(state, model);

    this.items = items;
  }

  static async fromState<T extends Deck>(this: Constructor<T>, state: DeckState): Promise<T | null> {
    const model = await Card.loadCardModel();

    if (!model) {
      return null;
    }

    return new this(state, model);
  }

  override async pickItem(): Promise<ServerBase<CardState> | null> {
    this.model.scaling.y -= 1;

    if (this.size < 1) {
      return null;
    }
    const isFipped = true;
    const cardState = isFipped ? this.items.pop()! : this.items.shift()!;

    cardState.transformation = this.transformation;
    cardState.transformation.position![1] += 1;

    const newCard = await ServerActorBuilder.buildCard(cardState);
    newCard?.pick();

    return newCard;
  }
}
