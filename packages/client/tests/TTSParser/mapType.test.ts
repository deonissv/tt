import { DEMO } from '@assets/demo';
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
      ActorType.DIE4,
      ActorType.DIE6,
      ActorType.DIE8,
      ActorType.DIE10,
      ActorType.DIE12,
      ActorType.DIE20,
      ActorType.ACTOR,
      ActorType.BAG,
      ActorType.TILE_STACK,
      ActorType.ACTOR,
      ActorType.BAG,
    ];

    const result = DEMO.OBJ.ObjectStates.map(obj => TTSParser.mapType(obj.Name));
    expect(result).toEqual(expected);
  });

  it('should return null for unknown types', () => {
    const result = TTSParser.mapType('Unknown');
    expect(result === null).toBeTruthy();
  });
});
