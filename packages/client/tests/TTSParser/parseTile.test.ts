import { CATAN } from '@assets/catan';
import type { Tuple } from '@babylonjs/core/types';
import { TTSParserC } from '@client/src/TTSParser/TTSParser';
import type { TileState } from '@tt/states';
import { ObjectState } from '@tt/tts-save';
import { degToRad } from '@tt/utils';

describe('TTSParser - parseTile', () => {
  let parser: TTSParserC;

  beforeEach(() => {
    parser = new TTSParserC();
  });

  it('should correctly parse catan box tile', () => {
    const expected: TileState = {
      guid: 'c7db6b',
      name: 'Custom_Tile',
      transformation: {
        position: [-25.60006, 1.01995218, -10.0008192],
        rotation: [-0.000286009861, 90.01969, -0.000416184164].map(degToRad) as Tuple<number, 3>,
        scale: [2.11755562, 1.0, 2.11755562],
      },
      type: 4,
      tileType: 0,
      faceURL: 'http://cloud-3.steamusercontent.com/ugc/155773601379927983/C7109CE55B4403815B5515C29EC5E3B9E534FEEC/',
      widthScale: 0,
      colorDiffuse: [1, 1, 1],
    };

    const parsed = parser.parseTile(CATAN.LONGEST_ROAD as unknown as ObjectState);
    expect(parsed !== null).toBeTruthy();
    expect(parsed).toStrictEqual(expected);
  });
});
