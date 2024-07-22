import { DEMO_CARD_OBJ } from '@assets/demo';
import { TTSParser } from '@client/src/TTSParser';
import type { CardState } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import { describe, expect, it } from 'vitest';

describe('TTSParser - parseCard', () => {
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

    const result = TTSParser.parseCard(DEMO_CARD_OBJ as unknown as ObjectState);
    expect(result).toMatchObject(expected);
  });
});
