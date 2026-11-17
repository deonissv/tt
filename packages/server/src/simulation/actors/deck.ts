import { Axis, Vector3, type Quaternion } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { containerSize } from '@tt/rules';
import type { DeckState } from '@tt/states';
import { shuffle as shuffleItems } from '@tt/utils';
import { releaseSlot, reserveSlot, restoreSlot, spawnDrawnItem } from '../behaviors/container';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class Deck extends ServerBase<DeckState> {
  get size(): number {
    return containerSize(this.toState()) ?? 0;
  }

  getPickRotation(): Quaternion {
    return this.absoluteRotationQuaternion;
  }

  static async fromState(state: DeckState): Promise<Deck | null> {
    const model = await Loader.loadMesh(AssetsManager.CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    model.scaling.y = state.cards.length;

    return new this(state, model);
  }

  async pickItem(clientId: string, pickHeight: number): Promise<ServerBase | null> {
    const state = this.toState();
    if (state.cards.length < 1) return null;
    const up = Vector3.TransformNormal(Axis.Y, this.model.getWorldMatrix()).normalize();
    const faceUp = Vector3.Dot(up, Axis.Y) > 0;
    const child = structuredClone(faceUp ? state.cards.at(-1)! : state.cards.at(0)!);
    const cards = structuredClone(faceUp ? state.cards.slice(0, -1) : state.cards.slice(1));
    const slot = reserveSlot(this, state.cards.length, faceUp);
    this.updateState({ guid: state.guid, cards });
    this.model.scaling.y = cards.length;
    try {
      return await spawnDrawnItem(this, child, clientId, pickHeight, () => {
        const cards = [...this.toState().cards];
        cards.splice(restoreSlot(slot), 0, child);
        this.updateState({ guid: this.guid, cards });
        this.model.scaling.y = cards.length;
      });
    } finally {
      releaseSlot(this, slot);
    }
  }

  shuffle() {
    const cards = structuredClone(this.toState().cards);
    shuffleItems(cards);
    this.updateState({ guid: this.guid, cards });
  }
}
