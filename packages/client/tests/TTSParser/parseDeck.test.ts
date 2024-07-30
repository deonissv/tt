import { MUNCHKIN } from '@assets/munchkin';
import { TTSParserC } from '@client/src/TTSParser';
import type { ActorBaseState, CardState } from '@shared/dto/states';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import { degToRad, omitKeys } from '@shared/utils';

describe('TTSParser - parseDeck', () => {
  let parser: TTSParserC;

  beforeEach(() => {
    parser = new TTSParserC();
  });

  it('should correctly parse a deck  with all properties', () => {
    const expected: ActorBaseState & { cards: (ActorBaseState & Partial<CardState>)[] } = {
      type: 3,
      guid: '482ca1',
      name: 'Deck',
      transformation: {
        position: [6.120835, 2.00653052, -4.454175],
        rotation: [8.95195e-9, 179.8918, 180.0].map(degToRad),
        scale: [1, 1, 1],
      },
      cards: [
        {
          guid: '04261a',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
          sequence: 2,
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693542667/FC40DF03381360D4824628BAABFB15C9FCAA2EE4/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
        },
        {
          guid: '04edb0',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
        },
        {
          guid: '097900',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
        },
        {
          guid: '108f8f',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
        },
        {
          guid: '13ea9f',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
        },
        {
          guid: '193422',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
        },
        {
          guid: '25fbf1',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
        },
        {
          guid: '361fdd',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
        },
        {
          guid: '367973',
          type: 2,
          name: 'Card',
        },
        {
          guid: '3a22f4',
          type: 2,
          name: 'Card',
          cols: 10,
          rows: 7,
        },
      ],
    };

    const parsed = parser.parseDeck(MUNCHKIN.DECK as unknown as ObjectState)!;
    expect(omitKeys(parsed, ['cards'])).toStrictEqual(omitKeys(expected, ['cards']));

    expected?.cards?.sort((a, b) => a.guid.localeCompare(b.guid));
    parsed?.cards?.sort((a, b) => a.guid.localeCompare(b.guid));

    expected?.cards?.forEach((card, i) => {
      expect(parsed.cards[i]).toMatchObject(card);
    });
  });

  it('should return null for incorrect or malformed deck objects', () => {
    expect(parser.parseDeck({} as unknown as ObjectState) === null).toBeTruthy();
  });
});
