import { DEMO_BAG_OBJ, DEMO_CUSTOM_BAG_OBJ } from '@assets/demo';
import { TTSParser } from '@client/src/TTSParser';
import type { BagState } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import { describe, expect, it } from 'vitest';

describe('TTSParser - parseBag', () => {
  it('should correctly parse demo bag', () => {
    const expected: BagState = {
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

    const result = TTSParser.parseBag(DEMO_BAG_OBJ as unknown as ObjectState);
    expect(result).toMatchObject(expected);
  });

  it('should correctly parse custom bag', () => {
    const expected: BagState = {
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

    const result = TTSParser.parseBag(DEMO_CUSTOM_BAG_OBJ as unknown as ObjectState);
    expect(result).toMatchObject(expected);
  });
});
