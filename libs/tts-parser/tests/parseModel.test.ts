import { CHESS5 } from '@tt/demo-saves';
import type { Model } from '@tt/states';
import type { CustomMeshState } from '@tt/tts-schema';
import { TTSParser } from '../src';

describe('TTSParser - parseModel', () => {
  beforeEach(() => {
    TTSParser.reset();
  });

  it('should correctly parse pawn custom mesh model', () => {
    const expected: Model = {
      meshURL: 'http://pastebin.com/raw.php?i=MyzfTvHM',
      colliderURL: 'http://pastebin.com/raw.php?i=MyzfTvHM',
      diffuseURL: 'http://i.imgur.com/BU3le9N.jpg',
    };
    const pawnMesh = CHESS5.PAWN.CustomMesh as CustomMeshState;
    expect(TTSParser.parseModel(pawnMesh)).toEqual(expected);
  });
});
