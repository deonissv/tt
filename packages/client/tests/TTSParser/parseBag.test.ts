import { DEMO } from '@assets/demo';
import { TTSParserC } from '@client/src/TTSParser';
import type { BagState } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import { beforeEach, describe, expect, it } from 'vitest';

describe('TTSParser - parseBag', () => {
  let parser: TTSParserC;

  beforeEach(() => {
    parser = new TTSParserC();
  });

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

    const result = parser.parseBag(DEMO.BAG as unknown as ObjectState);
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

    const result = parser.parseBag(DEMO.CUSTOM_BAG as unknown as ObjectState);
    expect(result).toMatchObject(expected);
  });
});
