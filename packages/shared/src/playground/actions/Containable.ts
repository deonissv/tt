import type { BagState, DeckState } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import { SharedBase } from '../actors';

export interface Containable {
  get size(): number;
  pickItem(): void;
}

export const isContainable = (object: any): object is Containable => {
  const Bag = SharedBase<BagState>;
  const TileStack = SharedBase<TileStackState>;
  const Deck = SharedBase<DeckState>;
  return object instanceof Bag || object instanceof TileStack || object instanceof Deck;
  // return (
  //   'size' in object &&
  //   'pickItem' in object &&
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //   typeof object.size === 'number' &&
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //   typeof object.pickItem === 'function'
  // );
};
