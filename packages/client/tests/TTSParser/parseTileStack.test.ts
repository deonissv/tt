import { DEMO } from '@assets/demo';
import TTSParser from '@client/src/TTSParser/TTSParser';
import { ActorType } from '@shared/dto/states';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import { degToRad } from '@shared/utils';
import { describe, expect, it } from 'vitest';

describe('TTSParser - parseTile', () => {
  it('should correctly parse catan box tile', () => {
    const expected: TileStackState = {
      guid: '51d35d',
      name: 'Custom_Tile_Stack',
      transformation: {
        position: [-4.740222, 0.91, 6.6680603],
        rotation: [-2.115622e-6, 179.9947, 2.31118474e-6].map(degToRad),
        scale: [0.692878, 1.0, 0.692878],
      },
      type: ActorType.TILE_STACK,
      tileType: 2,
      faceURL: 'http://i.imgur.com/vURavdX.jpg',
      backURL: 'http://i.imgur.com/vURavdX.jpg',
      size: 10,
    };

    const parsed = TTSParser.parseTileStack(DEMO.TILE_STACK as unknown as ObjectState)!;
    expect(parsed).toStrictEqual(expected);
  });
});
