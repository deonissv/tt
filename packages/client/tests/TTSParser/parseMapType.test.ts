import { DEMO_OBJ } from '@assets/demo';
import { TTSParser } from '@client/src/TTSParser';
import { ActorType } from '@shared/dto/states';
import { describe, expect, it } from 'vitest';

describe('TTSParser - mapType', () => {
  it('should correctly parse demo types', () => {
    const expected = [
      ActorType.DECK,
      ActorType.CARD,
      ActorType.BAG,
      ActorType.TILE,
      ActorType.TILE,
      ActorType.TILE,
      ActorType.TILE,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      ActorType.ACTOR,
      ActorType.BAG,
      ActorType.TILE,
      ActorType.ACTOR,
      ActorType.BAG,
    ];

    const result = DEMO_OBJ.ObjectStates.map(obj => TTSParser.mapType(obj.Name));
    expect(result).toEqual(expected);
  });
});
