import { Axis, Vector3, type Mesh } from '@babylonjs/core';
import type { Containable } from '@shared/playground/actions/Containable';
import { DeckMixin } from '@shared/playground/actors/DeckMixin';
import { shuffle } from '@shared/utils';
import { Loader } from '@tt/loader';
import type { CardState, DeckState } from '@tt/states';
import { ServerActorBuilder } from '../serverActorBuilder';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class Deck extends DeckMixin(ServerBase<DeckState>) implements Containable {
  flipped = false;

  constructor(state: DeckState, model: Mesh) {
    const items = state.cards;

    super(state, model);

    this.items = items;
  }

  static async fromState(state: DeckState): Promise<Deck | null> {
    const model = await Loader.loadMesh(AssetsManager.CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    model.scaling.y = state.cards.length;

    return new this(state, model);
  }

  isFaceUp(model: Mesh): boolean {
    const worldMatrix = model.getWorldMatrix();

    const meshUpVector = Vector3.TransformNormal(Axis.Y, worldMatrix);

    meshUpVector.normalize();
    const dotProduct = Vector3.Dot(meshUpVector, Axis.Y);
    return dotProduct > 0;
  }

  async pickItem(clientId: string, pickHeight: number): Promise<ServerBase<CardState> | null> {
    this.model.scaling.y -= 1;

    if (this.size < 1) {
      return null;
    }

    const isFaceUp = this.isFaceUp(this.model);

    const cardState = isFaceUp ? this.items.pop()! : this.items.shift()!;

    cardState.transformation = this.transformation;
    cardState.transformation.position![1] += 1;

    const newCard = await ServerActorBuilder.buildCard(cardState);
    newCard?.pick(clientId, pickHeight);

    return newCard;
  }

  shuffle() {
    shuffle(this.items);
  }
}
