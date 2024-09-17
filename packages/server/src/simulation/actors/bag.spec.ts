import { CreateBox, Logger } from '@babylonjs/core';
import { getPhSim } from '@server/test/testUtils';
import { ActorType } from '@shared/dto/states';
import { initHavok } from '@shared/initHavok';
import { wait } from '@shared/utils';
import { ServerActorBuilder } from '../serverActorBuilder';
import { Actor } from './actor';
import { Bag } from './bag';

describe('handleAction', () => {
  beforeAll(async () => {
    Logger.LogLevels = 0;

    await initHavok();
  });

  it('should spawn actor on pick', async () => {
    vi.spyOn(ServerActorBuilder, 'buildActor').mockImplementation(() => {
      return Promise.resolve(
        new Actor(
          {
            type: ActorType.ACTOR,
            guid: 'box',
            name: 'box',
            transformation: { position: [0, 0.6, 0] },
            model: { meshURL: '' },
          },
          CreateBox('box', { size: 1 }),
        ),
      );
    });

    const sim = getPhSim();
    const bag = new Bag(
      {
        type: ActorType.BAG,
        guid: 'bag',
        name: 'bag',
        transformation: { position: [0, 0.6, 0] },
        model: { meshURL: '' },
        containedObjects: [
          {
            type: ActorType.ACTOR,
            guid: 'box',
            name: 'box',
            transformation: { position: [0, 0.6, 0] },
            model: { meshURL: '' },
          },
        ],
      },
      CreateBox('bag', { size: 1 }),
    );

    sim.start();
    await wait(100);

    await bag.pickItem('', 1);
    await wait(100);

    const actors = sim.actors;
    expect(actors).toHaveLength(2);
    expect(actors[1].guid).toBe('box');
  });
});
