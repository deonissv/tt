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
    it('should throw a roll', async () => {
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
      await utils.wait(100);
      expect(die4.body.getLinearVelocity().y).not.toBe(0);
    });
  });

  describe('Align', () => {
    it('should align to [0, 0, 0]', () => {
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

      die4.pick('asd', 1);
      const targetRotation = die4.__targetRotation?.toEulerAngles().asArray();
      expect(targetRotation?.[0]).toBeCloseTo(0);
      expect(targetRotation?.[1]).toBeCloseTo(0);
      expect(targetRotation?.[2]).toBeCloseTo(0);
    });

    it('should align to [0, 0, 90]', () => {
      const die4 = new Die4(
        {
          type: ActorType.DIE4,
          guid: 'die4',
          name: 'die4',
          transformation: {
            rotation: [0, 0, 1.4],
          },
          rotationValues: [
            {
              value: 1,
              rotation: [0, 0, 0],
            },
            {
              value: 2,
              rotation: [0, 0, Math.PI / 2],
            },
            {
              value: 3,
              rotation: [0, 0, Math.PI],
            },
            {
              value: 4,
              rotation: [0, 0, (3 * Math.PI) / 2],
            },
          ],
        },
        CreateBox('box', { size: 1 }),
        CreateBox('box', { size: 1 }),
      );

      die4.pick('asd', 1);
      const targetRotation = die4.__targetRotation?.toEulerAngles().asArray();
      expect(targetRotation?.[0]).toBeCloseTo(0);
      expect(targetRotation?.[1]).toBeCloseTo(0);
      expect(targetRotation?.[2]).toBeCloseTo(Math.PI / 2);
    });

    it('should align to [0, 0, 90]', () => {
      const die4 = new Die4(
        {
          type: ActorType.DIE4,
          guid: 'die4',
          name: 'die4',
          transformation: {
            rotation: [0, 0, 3],
          },
          rotationValues: [
            {
              value: 1,
              rotation: [0, 0, 0],
            },
            {
              value: 2,
              rotation: [0, 0, Math.PI / 2],
            },
            {
              value: 3,
              rotation: [0, 0, Math.PI],
            },
            {
              value: 4,
              rotation: [0, 0, (3 * Math.PI) / 2],
            },
          ],
        },
        CreateBox('box', { size: 1 }),
        CreateBox('box', { size: 1 }),
      );

      die4.pick('asd', 1);
      const targetRotation = die4.__targetRotation?.toEulerAngles().asArray();
      expect(targetRotation?.[0]).toBeCloseTo(0);
      expect(targetRotation?.[1]).toBeCloseTo(0);
      expect(targetRotation?.[2]).toBeCloseTo(Math.PI);
    });
  });
});
