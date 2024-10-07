import { DEMO } from '@tt/demo-saves';
import type { BagState } from '@tt/states';
import { ActorType } from '@tt/states';
import { ObjectState } from '@tt/tts-save';
import { DeepPartial } from '@tt/utils';

import { TTSParser } from '../src';

describe('TTSParser - parseBag', () => {
  beforeEach(() => {
    TTSParser.reset();
  });

  it('should correctly parse demo bag', () => {
    const expected: DeepPartial<BagState> = {
      guid: '7a0b0b',
      name: 'Bag',
      type: ActorType.BAG,
      containedObjects: [
        {
          guid: '406fad',
          name: 'Card',
          type: ActorType.CARD,
        },
        {
          guid: '90d5b5',
          name: 'Card',
          type: ActorType.CARD,
        },
      ],
    };

    const result = TTSParser.parseBag(DEMO.BAG as unknown as ObjectState);
    expect(result).toMatchObject(expected);
  });

  it('should correctly parse custom bag', () => {
    const expected: DeepPartial<BagState> = {
      guid: '0d3e33',
      name: 'Custom_Model_Bag',
      type: ActorType.BAG,
      containedObjects: [
        {
          guid: 'f72c2b',
          name: 'Deck',
          type: ActorType.DECK,
        },
        {
          guid: '8f4bb9',
          name: 'Deck',
          type: ActorType.DECK,
        },
      ],
    };

    const result = TTSParser.parseBag(DEMO.CUSTOM_BAG as unknown as ObjectState);
    expect(result).toMatchObject(expected);
  });
});
