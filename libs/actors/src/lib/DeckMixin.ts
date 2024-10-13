import type { CardState, DeckState } from '@tt/states';
import type { Constructor } from '@tt/utils';
import type { SharedBase } from './SharedBase';

export const DeckMixin = <T extends Constructor<SharedBase<DeckState>>>(Base: T) => {
  return class Deck extends Base {
    items: CardState[];
    _size: number | null = null;

    get size() {
      return this._size ?? this.items.length;
    }

    override toState() {
      return {
        ...super.toState(),
        cards: this.items,
      };
    }
  };
};
