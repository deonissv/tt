import { DEMO } from '@tt/demo-saves';
import { ActorType } from '@tt/states';

import { TTSParser } from '../src';

describe('TTSParser - mapType', () => {
  beforeEach(() => {
    TTSParser.reset();
  });

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

  it('should parse rounded dice', () => {
    const result = TTSParser.mapType('Die_6_Rounded');
    expect(result).toEqual(ActorType.DIE6ROUND);
  });

  it('should return null for unknown types', () => {
    const result = TTSParser.mapType('Unknown');
    expect(result === null).toBeTruthy();
  });
});
