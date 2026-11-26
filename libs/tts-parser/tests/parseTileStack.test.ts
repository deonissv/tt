import { DEMO } from '@tt/demo-saves';
import { ActorType, type TileStackState } from '@tt/states';
import { degToRad, type Tuple } from '@tt/utils';
import { TTSParser } from '../src';

describe('TTSParser - parseTile', () => {
  beforeEach(() => {
    TTSParser.reset();
  });

  it('should correctly parse catan box tile', () => {
    const expected: TileStackState = {
      guid: '51d35d',
      name: 'Custom_Tile_Stack',
      transformation: {
        position: [-4.740222, 0.91, 6.6680603],
        rotation: [-2.115622e-6, 179.9947, 2.31118474e-6].map(degToRad) as Tuple<number, 3>,
        scale: [0.692878, 1.0, 0.692878],
      },
      type: ActorType.TILE_STACK,
      tileType: 2,
      faceURL: 'http://i.imgur.com/vURavdX.jpg',
      backURL: 'http://i.imgur.com/vURavdX.jpg',
      size: 10,
      widthScale: 0,
      colorDiffuse: [1, 1, 1],
    };

    const parsed = TTSParser.parseTileStack(DEMO.TILE_STACK)!;
    expect(parsed).toStrictEqual(expected);
  });
});
