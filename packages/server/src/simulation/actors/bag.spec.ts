import { CreateBox, Logger } from '@babylonjs/core';
import { ActorType } from '@tt/states';
import { wait } from '@tt/utils';
import { initHavok } from '../../../src/utils';
import { getPhSim } from '../../../test/testUtils';
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

// describe('Bag', () => {
//   useSimulationMock();

//   const Bag = BagMixin(SharedBase<BagState>);
//   let mesh: Mesh;
//   let state: BagState;

//   beforeEach(() => {
//     vi.restoreAllMocks();
//     mesh = CreateBox('testMesh', { size: 1 });

//     state = {
//       type: 1,
//       guid: '1234',
//       name: 'testActor',
//       transformation: {
//         scale: [1, 1, 1],
//         rotation: [0, 0, 0],
//         position: [0, 0, 0],
//       },
//       containedObjects: [
//         {
//           type: 2,
//           guid: '1234',
//           name: 'testActor',
//           transformation: {
//             scale: [1, 1, 1],
//             rotation: [0, 0, 0],
//             position: [0, 0, 0],
//           },
//           faceURL: '',
//           backURL: '',
//           rows: 1,
//           cols: 1,
//           sequence: 0,
//         } as ActorBaseState,
//       ],
//     };
//   });

//   it('should construct with correct properties', () => {
//     const bag = new Bag(state, mesh);
//     expect(bag instanceof Bag).toBeTruthy();
//   });

//   it('fromState creates a Bag instance with correct properties', async () => {
//     const bag = await Bag.fromState(state);
//     expect(bag instanceof Bag).toBeTruthy();
//   });

//   it('fromState returns null if model is not loaded', async () => {
//     vi.spyOn(Loader, 'loadModel').mockResolvedValue([null, null]);
//     const bag = await Bag.fromState(state);
//     expect(bag == null).toBeTruthy();
//   });

//   it('should construct using fromState value', async () => {
//     const bag = new Bag(state, mesh);
//     expect(bag instanceof Bag).toBeTruthy();

//     const stateFromState = bag.toState();
//     const newBag = await Bag.fromState(stateFromState);

//     expect(newBag instanceof Bag).toBeTruthy();
//   });
// });
