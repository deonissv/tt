import { CATAN, MUNCHKIN } from '@tt/demo-saves';
import { ObjectState } from '@tt/tts-save';
import { degToRad, Tuple } from '@tt/utils';
import { TTSParser } from '../src';

describe('TTSParser - parseActorBase', () => {
  beforeEach(() => {
    TTSParser.reset();
  });

  it('should parse munchkin deck', () => {
    const expected: ReturnType<typeof TTSParser.parseActorBase> = {
      guid: '482ca1',
      name: 'Deck',
      transformation: {
        position: [6.120835, 2.00653052, -4.454175],
        rotation: [8.95195e-9, 179.8918, 180.0].map(degToRad) as Tuple<number, 3>,
        scale: [1, 1, 1],
      },
      colorDiffuse: [0.713235259, 0.713235259, 0.713235259],
    };
    expect(TTSParser.parseActorBase(MUNCHKIN.DECK as unknown as ObjectState)).toEqual(expected);
  });

  it('should parse catan deck', () => {
    const expected: ReturnType<typeof TTSParser.parseActorBase> = {
      guid: '162411',
      name: 'Deck',
      transformation: {
        position: [-24.4997139, 1.07239747, 8.776062],
        rotation: [-3.513968e-8, 180.000778, -2.24918551e-7].map(degToRad) as Tuple<number, 3>,
        scale: [1, 1, 1],
      },
      colorDiffuse: [0.713235259, 0.713235259, 0.713235259],
    };
    expect(TTSParser.parseActorBase(CATAN.DECK as unknown as ObjectState)).toEqual(expected);
  });
});
