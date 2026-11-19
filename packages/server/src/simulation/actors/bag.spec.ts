import { CreateBox, Logger } from '@babylonjs/core';
import { ActorType, type UnknownActorState } from '@tt/states';
import { wait } from '@tt/utils';
import { initHavok } from '../../../src/utils';
import { getPhSim } from '../../../test/testUtils';
import { ServerActorBuilder } from '../serverActorBuilder';
import { Actor } from './actor';
import { Bag } from './bag';

describe('container behavior', () => {
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

  it('hands out fresh copies from an infinite bag without depleting it', async () => {
    const built: UnknownActorState[] = [];
    vi.spyOn(ServerActorBuilder, 'buildActor').mockImplementation(state => {
      built.push(state);
      return Promise.resolve(
        new Actor(
          {
            type: ActorType.ACTOR,
            guid: state.guid,
            name: 'copy',
            transformation: { position: [0, 0.6, 0] },
            model: { meshURL: '' },
          },
          CreateBox(`copy-${built.length}`, { size: 1 }),
        ),
      );
    });

    const sim = getPhSim();
    const bag = new Bag(
      {
        type: ActorType.BAG,
        guid: 'infbag',
        name: 'infbag',
        infinite: true,
        transformation: { position: [0, 0.6, 0] },
        model: { meshURL: '' },
        containedObjects: [
          {
            type: ActorType.ACTOR,
            guid: 'coin',
            name: 'coin',
            transformation: { position: [0, 0.6, 0] },
            model: { meshURL: '' },
          },
        ],
      },
      CreateBox('infbag', { size: 1 }),
    );

    sim.start();
    await wait(100);

    await pickItem(bag, '', 1);
    await wait(100);
    await pickItem(bag, '', 1);
    await wait(100);

    expect(built).toHaveLength(2);
    expect(built[0].guid).not.toBe(built[1].guid);
    const bagState = bag.toState() as UnknownActorState & { containedObjects: { guid: string }[] };
    expect(bagState.containedObjects.map(item => item.guid)).toEqual(['coin']);
  });
});
