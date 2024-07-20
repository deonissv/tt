import { CATAN_LONGEST_ROAD_OBJ } from '@assets/catan';
import TTSParser from '@client/src/TTSParser/TTSParser';
import { degToRad } from '@client/src/utils';
import type { TileState } from '@shared/dto/simulation/TileState';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import { describe, expect, it } from 'vitest';

describe('TTSParser - parseTile', () => {
  it('should correctly parse catan box tile', () => {
    const expected: TileState = {
      guid: 'c7db6b',
      name: 'Custom_Tile',
      transformation: {
        position: [-25.60006, 1.01995218, -10.0008192],
        rotation: [-0.000286009861, 90.01969, -0.000416184164].map(degToRad),
        scale: [2.11755562, 1.0, 2.11755562],
      },
      type: 0,
      faceURL: 'http://cloud-3.steamusercontent.com/ugc/155773601379927983/C7109CE55B4403815B5515C29EC5E3B9E534FEEC/',
    };

    const parsed = TTSParser.parseTile(CATAN_LONGEST_ROAD_OBJ as unknown as ObjectState)!;
    expect(parsed).toStrictEqual(expected);
  });
});
