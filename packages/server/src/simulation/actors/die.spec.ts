import { CreateBox } from '@babylonjs/core';
import { getPhSim } from '@server/test/testUtils';
import { ActorType } from '@shared/dto/states';
import { initHavok } from '@shared/initHavok';
import * as utils from '@shared/utils';
import { Die4 } from './die';

vi.mock('@shared/utils');

describe('Die', () => {
  beforeAll(async () => {
    await initHavok();
    getPhSim();
  });

  describe('Roll', () => {
    it('should roll a number between 1 and 4', () => {
      (utils.getRandomInt as unknown as ReturnType<typeof vi.spyOn>).mockReturnValue(1);

      const die4 = new Die4(
        {
          type: ActorType.DIE4,
          guid: 'die4',
          name: 'die4',
          rotationValues: [
            {
              value: 1,
              rotation: [0, 0, 0],
            },
            {
              value: 2,
              rotation: [0, 0, 90],
            },
            {
              value: 3,
              rotation: [0, 0, 180],
            },
            {
              value: 4,
              rotation: [0, 0, 270],
            },
          ],
        },
        CreateBox('box', { size: 1 }),
        CreateBox('box', { size: 1 }),
      );
      die4.roll();
      expect(die4.body.getLinearVelocity().y).not.toBe(0);
    });
  });
});
