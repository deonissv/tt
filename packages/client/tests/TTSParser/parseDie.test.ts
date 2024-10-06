import { DEMO } from '@assets/demo';
import { TTSParserC } from '@client/src/TTSParser';
import type { Die4State, Die6State, Die8State } from '@tt/states';
import { ActorType } from '@tt/states';
import { ObjectState } from '@tt/tts-save';

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
          rotation: [0.3141592653589793, -4.2062434973063345, -2.0943951023931953],
        },
        {
          value: 2,
          rotation: [-1.5707963267948966, -1.0471975511965976, 0],
        },
        {
          value: 3,
          rotation: [0.3141592653589793, -2.111848394913139, 0],
        },
        {
          value: 4,
          rotation: [0.3141592653589793, 0, -4.1887902047863905],
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
          rotation: [-1.5707963267948966, 0, 0],
        },
        {
          value: 2,
          rotation: [0, 0, 0],
        },
        {
          value: 3,
          rotation: [0, 0, -1.5707963267948966],
        },
        {
          value: 4,
          rotation: [0, 0, 1.5707963267948966],
        },
        {
          value: 5,
          rotation: [0, 0, -3.141592653589793],
        },
        {
          value: 6,
          rotation: [1.5707963267948966, 0, 0],
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
          rotation: [-0.5759586531581288, 0, 1.5707963267948966],
        },
        {
          value: 2,
          rotation: [-0.5759586531581288, 0, 3.141592653589793],
        },
        {
          value: 3,
          rotation: [0.5759586531581288, 3.141592653589793, -3.141592653589793],
        },
        {
          value: 4,
          rotation: [0.5759586531581288, 3.141592653589793, 1.5707963267948966],
        },
        {
          value: 5,
          rotation: [0.5759586531581288, 3.141592653589793, -1.5707963267948966],
        },
        {
          value: 6,
          rotation: [0.5759586531581288, 3.141592653589793, 0],
        },
        {
          value: 7,
          rotation: [-0.5759586531581288, 0, 0],
        },
        {
          value: 8,
          rotation: [-0.5759586531581288, 0, -1.5707963267948966],
        },
      ],
    };

    const result = parser.parseDieN(DEMO.DIE8 as unknown as ObjectState, ActorType.DIE8);
    expect(result).toMatchObject(expected);
  });
});
