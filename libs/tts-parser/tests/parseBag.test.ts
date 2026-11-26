import { DEMO } from '@tt/demo-saves';
import type { BagState } from '@tt/states';
import { ActorType } from '@tt/states';
import type { DeepPartial } from '@tt/utils';

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

    const result = TTSParser.parseBag(DEMO.BAG);
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

    const result = TTSParser.parseBag(DEMO.CUSTOM_BAG);
    expect(result).toMatchObject(expected);
  });

  it('marks Infinite_Bag saves as never-depleting containers', () => {
    const result = TTSParser.parseBag(DEMO.INFINITE_BAG);

    expect(result?.type).toBe(ActorType.BAG);
    expect(result?.infinite).toBe(true);
    expect(result?.containedObjects).toHaveLength(1);
  });

  it.each(['Bag', 'Custom_Model_Bag'])('leaves ordinary %s saves finite', Name => {
    const result = TTSParser.parseBag({ ...DEMO.BAG, Name });

    expect(result?.infinite).toBeUndefined();
  });

  it.each(['Infinite_Bag', 'Custom_Model_Infinite_Bag', 'custom_model_infinite_bag', 'infinite_bag'])(
    'routes %s through the current parser',
    Name => {
      const result = TTSParser.parse(
        JSON.stringify({
          ObjectStates: [{ ...DEMO.INFINITE_BAG, Name }],
        }),
      );

      expect(result?.actorStates?.[0]).toMatchObject({
        type: ActorType.BAG,
        infinite: true,
      });
      const bag = result?.actorStates?.[0] as BagState;
      expect(bag.containedObjects).toHaveLength(1);
      expect(typeof bag.containedObjects[0].guid).toBe('string');
    },
  );

  it('does not treat an incidental infinite substring as the save prefix', () => {
    expect(TTSParser.parseBag({ ...DEMO.BAG, Name: 'Custom_Infinite_Bag' })?.infinite).toBeUndefined();
  });

  it('preserves nested container variants as templates', () => {
    const result = TTSParser.parseBag({
      ...DEMO.INFINITE_BAG,
      ContainedObjects: [DEMO.BAG],
    });

    expect(result?.containedObjects[0]).toMatchObject({
      type: ActorType.BAG,
      containedObjects: [
        expect.objectContaining({ type: ActorType.CARD }),
        expect.objectContaining({ type: ActorType.CARD }),
      ],
    });
  });
});
