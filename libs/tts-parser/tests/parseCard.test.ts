import { DEMO } from '@tt/demo-saves';
import type { CardState } from '@tt/states';
import { ActorType } from '@tt/states';
import { ObjectState } from '@tt/tts-save';
import { TTSParser } from '../src';

describe('TTSParser - parseCard', () => {
  beforeEach(() => {
    TTSParser.reset();
  });

  it('should correctly parse demo types', () => {
    const expected: CardState = {
      guid: '0c029c',
      name: 'Card',
      type: ActorType.CARD,
      faceURL:
        'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
      backURL:
        'https://steamusercontent-a.akamaihd.net/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
      cols: 10,
      rows: 7,
      sequence: 33,
    };

    const result = TTSParser.parseCard(DEMO.CARD as unknown as ObjectState);
    expect(result).toMatchObject(expected);
  });

  it('should parse CardID 0 when a matching CustomDeck exists', () => {
    const source = structuredClone(DEMO.CARD) as unknown as ObjectState & { CustomDeck: Record<number, object> };
    const deckId = Math.floor(source.CardID! / 100);
    source.CardID = 0;
    source.CustomDeck = { 0: source.CustomDeck[deckId] };

    const result = TTSParser.parseCard(source);
    expect(result).not.toBeNull();
    expect(result!.sequence).toBe(0);
  });

  it('should reject a card with no CardID', () => {
    const source = structuredClone(DEMO.CARD) as unknown as ObjectState;
    delete source.CardID;

    expect(TTSParser.parseCard(source)).toBeNull();
  });
});
