import { DEMO } from '@assets/demo';
import { TTSParserC } from '@client/src/TTSParser';
import type { Die4State, Die6State, Die8State } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import type { ObjectState } from '@shared/tts-model/ObjectState';

describe('TTSParser - parseDie', () => {
  let parser: TTSParserC;

  beforeEach(() => {
    parser = new TTSParserC();
  });

  it('should correctly parse demo die4', () => {
    const expected: Die4State = {
      guid: '60c5a3',
      name: 'Die_4',
      type: ActorType.DIE4,
      rotationValues: [
        {
          value: 1,
          rotation: [18, -241, -120],
        },
        {
          value: 2,
          rotation: [-90, -60, 0],
        },
        {
          value: 3,
          rotation: [18, -121, 0],
        },
        {
          value: 4,
          rotation: [18, 0, -240],
        },
      ],
    };

    const result = parser.parseDieN(DEMO.DIE4 as unknown as ObjectState, ActorType.DIE4);
    expect(result).toMatchObject(expected);
  });

  it('should correctly parse demo die6', () => {
    const expected: Die6State = {
      guid: 'cabfb6',
      name: 'Die_6',
      type: ActorType.DIE6,
      rotationValues: [
        {
          value: 1,
          rotation: [-90, 0, 0],
        },
        {
          value: 2,
          rotation: [0, 0, 0],
        },
        {
          value: 3,
          rotation: [0, 0, -90],
        },
        {
          value: 4,
          rotation: [0, 0, 90],
        },
        {
          value: 5,
          rotation: [0, 0, -180],
        },
        {
          value: 6,
          rotation: [90, 0, 0],
        },
      ],
    };

    const result = parser.parseDieN(DEMO.DIE6 as unknown as ObjectState, ActorType.DIE6);
    expect(result).toMatchObject(expected);
  });

  it('should correctly parse demo die8', () => {
    const expected: Die8State = {
      guid: 'bef483',
      name: 'Die_8',
      type: ActorType.DIE8,
      rotationValues: [
        {
          value: 1,
          rotation: [-33, 0, 90],
        },
        {
          value: 2,
          rotation: [-33, 0, 180],
        },
        {
          value: 3,
          rotation: [33, 180, -180],
        },
        {
          value: 4,
          rotation: [33, 180, 90],
        },
        {
          value: 5,
          rotation: [33, 180, -90],
        },
        {
          value: 6,
          rotation: [33, 180, 0],
        },
        {
          value: 7,
          rotation: [-33, 0, 0],
        },
        {
          value: 8,
          rotation: [-33, 0, -90],
        },
      ],
    };

    const result = parser.parseDieN(DEMO.DIE8 as unknown as ObjectState, ActorType.DIE8);
    expect(result).toMatchObject(expected);
  });
});
