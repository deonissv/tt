import { CHESS_PAWN_OBJ } from '@assets/chess5';
import TTSParser from '@client/src/TTSParser/TTSParser';
import type { ActorState } from '@shared/dto/states';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import { degToRad } from '@shared/utils';
import { describe, expect, it } from 'vitest';

describe('TTSParser - parseCustomObject', () => {
  it('should correctly parse a custom object with all properties', () => {
    const expected: ActorState = {
      type: 0,
      guid: '8d1169',
      name: 'Custom_Model',
      transformation: {
        position: [-0.101872981, 0.932778358, -0.41528818],
        rotation: [7.849053e-5, 0.00295239175, 5.95842675e-6].map(degToRad),
        scale: [2.75, 2.75, 2.75],
      },
      model: {
        meshURL: 'http://pastebin.com/raw.php?i=MyzfTvHM',
        colliderURL: 'http://pastebin.com/raw.php?i=MyzfTvHM',
        diffuseURL: 'http://i.imgur.com/BU3le9N.jpg',
      },
      colorDiffuse: [1.0, 1.0, 1.0],
    };
    expect(TTSParser.parseCustomObject(CHESS_PAWN_OBJ as unknown as ObjectState)).toEqual(expected);
  });
});
