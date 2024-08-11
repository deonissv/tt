import type { Texture } from '@babylonjs/core';
import type { CardState, DeckState } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import type { Containable } from '../actions/Containable';
import type { SharedBase } from './SharedBase';

export const DeckMixin = <T extends Constructor<SharedBase<DeckState>>>(Base: T) => {
  return class Deck extends Base implements Containable {
    items: CardState[];

    // constructor(state: DeckState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    //   const items = state.cards;

    //   super(state, model);

    //   this.items = items;
    //   this.renderDeck(faceTexture, backTexture);
    // }

    get size() {
      return this.items.length;
    }

    override toState() {
      return {
        ...super.toState(),
        cards: this.items,
      };
    }

    pickItem(): Promise<SharedBase<CardState> | null> {
      throw new Error('Not implemented');
    }

    renderDeck(_faceTexture: Texture, _backTexture: Texture) {
      throw new Error('Not implemented');
    }
  };
};
