/* eslint-disable @typescript-eslint/dot-notation */
import { Logger, Mesh, Scene } from '@babylonjs/core';
import { jest } from '@jest/globals';

import { type ActorState, type SimulationStateSave, type SimulationStateUpdate } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { omitKeys } from '@shared/utils';
import { initHavok } from '../utils';
import Actor from './actor';
import { Simulation } from './simulation';

describe('Simulation', () => {
  beforeAll(async () => {
    Logger.LogLevels = 0;

    await initHavok();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(Loader, 'loadModel').mockImplementation(() => {
      return Promise.resolve([new Mesh('testMesh'), null]);
    });
    jest.spyOn(Loader, 'loadMesh').mockImplementation(() => {
      return Promise.resolve(new Mesh('testMesh'));
    });
  });

  describe('init', () => {
    it('Simulation init creates scene and sets left handed system', async () => {
      const initialState = { leftHandedSystem: false };
      const sim = await Simulation.init(initialState, jest.fn());

      expect(sim['scene'] instanceof Scene).toBe(true);
      expect(sim['scene'].useRightHandedSystem).toBe(true);

      const leftHandedState = { leftHandedSystem: true };
      const sim2 = await Simulation.init(leftHandedState, jest.fn());
      expect(sim2['scene'].useRightHandedSystem).toBe(false);
    });

    it('Simulation init calls onModelLoaded for each loaded actor', async () => {
      const mockOnModelLoaded = jest.fn();
      const initialState: SimulationStateSave = {
        actorStates: [
          {
            type: 0,
            guid: '1',
            name: '',
            model: {
              meshURL: '',
            },
          },
          {
            type: 0,
            guid: '2',
            name: '',
            model: {
              meshURL: '',
            },
          },
        ],
      };
      await Simulation.init(initialState, mockOnModelLoaded);

      expect(mockOnModelLoaded).toHaveBeenCalledTimes(2);
    });

    it('Simulation init calls onSucceed for successfully loaded actors', async () => {
      const mockOnSucceed = jest.fn();
      const initialState = {
        actorStates: [
          {
            type: 0,
            guid: '1',
            name: '',
            model: {
              meshURL: '',
            },
          },
        ],
      };
      jest.spyOn(Actor, 'fromState').mockImplementation((state: ActorState) => {
        return Promise.resolve(new Actor(state, new Mesh('testMesh')));
      });
      await Simulation.init(initialState, jest.fn(), mockOnSucceed);

      expect(mockOnSucceed).toHaveBeenCalledTimes(1);
    });

    it('Simulation init calls onFailed for failed actors', async () => {
      const mockOnFailed = jest.fn();
      const initialState = {
        actorStates: [
          {
            type: 0,
            guid: '1',
            name: '',
            model: {
              meshURL: '',
            },
          },
        ],
      };
      jest.spyOn(Loader, 'loadModel').mockReturnValueOnce(Promise.resolve([null, null]));
      jest.spyOn(Actor, 'fromState').mockReturnValueOnce(Promise.resolve(null));
      await Simulation.init(initialState, jest.fn(), jest.fn(), mockOnFailed);

      expect(mockOnFailed).toHaveBeenCalledTimes(1);
    });
  });

  // describe('update', () => {
  //   it('updates actors based on state', async () => {
  //     const initialState: SimulationStateSave = {
  //       actorStates: [
  //         { guid: 'actor1', name: 'actor1', model: { meshURL: '' }, transformation: { position: [0, 0, 0] } },
  //       ],
  //       leftHandedSystem: false,
  //       gravity: -9.8,
  //     };
  //     const actorState = initialState.actorStates![0];
  //     jest.spyOn(Actor, 'fromState').mockImplementation((state: ActorState) => {
  //       return Promise.resolve(new Actor(state, new Mesh('testMesh')));
  //     });
  //     const sim = await Simulation.init(initialState);
  //     const simActor = sim['scene'].meshes.find(m => (m.parent! as Actor).guid === initialState.actorStates![0].guid)
  //       ?.parent;
  //     expect(simActor?.['__targetPosition']).toEqual(null);

  //     const newState = { guid: actorState.guid, transformation: { position: [1, 2, 3] } };
  //     sim.update({ actorStates: [newState] });

  //     expect(simActor?.['__targetPosition']).toEqual(new Vector3(1, 2, 3));
  //   });

  // it('does not update non-existent actors', async () => {
  //   const initialState: SimulationStateSave = {
  //     actorStates: [
  //       { guid: 'actor1', name: 'actor1', model: { meshURL: '' }, transformation: { position: [0, 0, 0] } },
  //     ],
  //     leftHandedSystem: false,
  //     gravity: -9.8,
  //   };
  //   jest.spyOn(Actor, 'fromState').mockImplementation((state: ActorState) => {
  //     return Promise.resolve(new Actor(state, new Mesh('testMesh')));
  //   });
  //   const sim = await Simulation.init(initialState);
  //   const simActor = sim['scene'].meshes.find(m => m.name === 'model')?.parent;
  //   expect(simActor?.['__targetPosition']).toEqual(null);

  //   const newState = { guid: 'unknown', transformation: { position: [1, 2, 3] } };
  //   sim.update({ actorStates: [newState] });

  //   expect(simActor?.['__targetPosition']).toEqual(null);
  // });
  // });

  describe('toStateUpdate', () => {
    it('returns actor state updates', async () => {
      const initialState: SimulationStateSave = {
        actorStates: [
          {
            type: 0,
            guid: 'actor1',
            name: 'actor1',
            model: { meshURL: '' },
            transformation: { position: [0, 0, 0] },
          },
        ],
        leftHandedSystem: false,
        gravity: -9.8,
      };
      jest.spyOn(Actor, 'fromState').mockImplementation((state: ActorState) => {
        return Promise.resolve(new Actor(state, new Mesh('testMesh')));
      });
      const sim = await Simulation.init(initialState);
      expect(sim.toStateUpdate(initialState)).toEqual({});

      // phisics required
      // const newState = { actorStates: [{ guid: 'actor1', transformation: { position: [1, 2, 3] } }] };
      // sim.update(newState);
      // sim.start();
      // await new Promise(resolve => setTimeout(resolve, 1000));
      // sim['engine'].stopRenderLoop();

      // expect(sim.toStateUpdate(initialState)).toEqual({ newState });
    });
  });

  describe('toState', () => {
    it('returns complete state save', async () => {
      const initialState: SimulationStateSave = {
        table: {
          url: '',
          type: 'Custom',
        },
        gravity: 0.5,
        actorStates: [
          {
            type: 0,
            guid: '4deedc',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [6, 1.05375, -16.9],
              rotation: [2.246773551106098e-8, 1.139143005901462e-7, -4.032632507377682e-9],
            },
          },
          {
            type: 0,
            guid: 'cc04c1',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [6, 1.05375, -17.15],
              rotation: [1.642825077168346e-8, 1.02194769837507e-7, 2.836869650458061e-9],
            },
          },
          {
            type: 0,
            guid: 'ec6baf',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [6, 1.05375, -17.65],
              rotation: [6.846944929171024e-9, 5.573053176230747e-8, -4.282685829310909e-9],
            },
          },
          {
            type: 0,
            guid: 'a25ed9',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [6, 1.05375, -17.9],
              rotation: [2.481328558721127e-8, 1.10519619487054e-7, 2.912773007336329e-9],
            },
          },
          {
            type: 0,
            guid: '338d84',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [6, 1.05375, -18.15],
              rotation: [2.813894188544686e-8, 1.234614601654008e-7, -3.063334690470953e-9],
            },
          },
          {
            type: 0,
            guid: '4258fc',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [6, 1.05375, -18.4],
              rotation: [-4.161573540430792e-10, 2.975651251259643e-7, -4.180247533682872e-9],
            },
          },
          {
            type: 0,
            guid: 'be6eac',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [6, 1.05375, -18.65],
              rotation: [2.127503300171827e-8, 1.352528068534364e-7, -3.225271748991668e-9],
            },
          },
          {
            type: 0,
            guid: '8308b8',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [4.8, 1.05375, -16.9],
              rotation: [3.724101527430657e-8, 2.34068685581594e-7, 1.515460570357966e-9],
            },
          },
          {
            type: 0,
            guid: '8037ee',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [4.8, 1.05375, -17.15],
              rotation: [3.083060558756626e-8, 2.425645958237934e-7, 6.821726108303597e-9],
            },
          },
          {
            type: 0,
            guid: '569a1b',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [4.8, 1.05375, -17.4],
              rotation: [8.010253790075538e-9, 6.568184710953673e-8, -2.816469229869786e-9],
            },
          },
          {
            type: 0,
            guid: '641e9b',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [4.8, 1.05375, -17.65],
              rotation: [1.35391532429169e-8, 1.125800782329385e-7, -4.474634295558566e-9],
            },
          },
          {
            type: 0,
            guid: '7ad8ce',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [4.8, 1.05375, -17.9],
              rotation: [5.723982478065719e-9, -9.260031096685878e-8, 7.334825367094333e-9],
            },
          },
          {
            type: 0,
            guid: '179e08',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [7.7, 1.16497314, -17],
              rotation: [-1.145192901774174e-8, 1.57079510506442, -7.808016642793961e-10],
            },
          },
          {
            type: 0,
            guid: '0ac7cb',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [7.70000362, 1.16497326, -17.4999962],
              rotation: [-1.434492569932372e-8, 1.570796326794897, 4.19479960029381e-10],
            },
          },
          {
            type: 0,
            guid: 'd55405',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [7.7, 1.16497314, -18],
              rotation: [8.84915964681539e-9, 1.570795628663196, 2.55655043433966e-9],
            },
          },
          {
            type: 0,
            guid: '4edfbe',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [7.00000048, 1.16497314, -17],
              rotation: [-9.704841241806267e-10, 1.570793010669318, 4.237745171868383e-8],
            },
          },
          {
            type: 0,
            guid: '3c94b0',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [7, 1.16497314, -17.5],
              rotation: [-1.427631855175707e-8, 1.570796326794897, 4.900506902709824e-8],
            },
          },
          {
            type: 0,
            guid: 'f7103c',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [4.8, 1.05375, -18.15],
              rotation: [1.412431552336627e-8, 5.882052794535226e-8, -3.778187535620709e-9],
            },
          },
          {
            type: 0,
            guid: 'f66474',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [4.8, 1.05375, -18.4],
              rotation: [2.915101381278244e-8, 3.209893076993693e-7, 1.615750248739739e-9],
            },
          },
          {
            type: 0,
            guid: '608cbc',
            name: 'City',
            model: { meshURL: '', colliderURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [8.8, 1.244515, -17],
              rotation: [1.053670239117971e-7, 1.570795977729046, -4.846887543201876e-7],
            },
          },
          {
            type: 0,
            guid: 'c090bf',
            name: 'City',
            model: { meshURL: '', colliderURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [8.799999, 1.24451506, -18.0000019],
              rotation: [1.475137797552816e-7, 1.570799293854625, 1.475141811810095e-7],
            },
          },
          {
            type: 0,
            guid: 'e450b4',
            name: 'City',
            model: { meshURL: '', colliderURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [8.8, 1.24451518, -18.4999943],
              rotation: [1.68586344091793e-7, 1.570804529842381, 2.528817868110463e-7],
            },
          },
          {
            type: 0,
            guid: 'f02479',
            name: 'City',
            model: { meshURL: '', colliderURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [8.8, 1.244515, -17.5],
              rotation: [-1.053673174761773e-7, 1.570795454130271, -4.00395027259589e-7],
            },
          },
          {
            type: 0,
            guid: '9649a4',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.99649936, 1, 0.9965063],
            transformation: {
              scale: [1, 1, 1],
              position: [34.9, 1.05375016, -17.15],
              rotation: [6.817377219046525e-10, 6.919137419353577e-8, -8.14738153433122e-9],
            },
          },
          {
            type: 0,
            guid: 'd05034',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              position: [6, 1.05375, -17.4],
              rotation: [4.000767350545613e-9, 7.473333509708712e-8, -7.429229580562883e-9],
            },
          },
          {
            type: 0,
            guid: '553bb7',
            name: 'Traders & Barbarians - Game Logic',
            model: { meshURL: '' },
            colorDiffuse: [0.552623332, 0.0599260852, 0.702090561],
            transformation: {
              scale: [0.2, 0.2, 0.2],
              position: [-70, 130, 100],
              rotation: [0, 1.570796326794897, 3.141592653589793],
            },
          },
        ],
        leftHandedSystem: true,
      };
      jest.spyOn(Actor, 'fromState').mockImplementation((state: ActorState) => {
        return Promise.resolve(new Actor(state, new Mesh('testMesh')));
      });
      const sim = await Simulation.init(initialState);

      const expected: SimulationStateSave = {
        table: {
          url: '',
          type: 'Custom',
        },
        gravity: 0.5,
        actorStates: [
          {
            type: 0,
            guid: '641e9b',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [1.35391532429169e-8, 1.125800782329385e-7, -4.474634295558566e-9],
              position: [4.8, 1.05375, -17.65],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '4deedc',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [2.246773551106098e-8, 1.139143005901462e-7, -4.032632507377682e-9],
              position: [6, 1.05375, -16.9],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '8308b8',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [3.724101527430657e-8, 2.34068685581594e-7, 1.515460570357966e-9],
              position: [4.8, 1.05375, -16.9],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '7ad8ce',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [5.723982478065719e-9, -9.260031096685878e-8, 7.334825367094333e-9],
              position: [4.8, 1.05375, -17.9],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'ec6baf',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [6.846944929171024e-9, 5.573053176230747e-8, -4.282685829310909e-9],
              position: [6, 1.05375, -17.65],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '338d84',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [2.813894188544686e-8, 1.234614601654008e-7, -3.063334690470953e-9],
              position: [6, 1.05375, -18.15],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'a25ed9',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [2.481328558721127e-8, 1.10519619487054e-7, 2.912773007336329e-9],
              position: [6, 1.05375, -17.9],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'f7103c',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [1.412431552336627e-8, 5.882052794535226e-8, -3.778187535620709e-9],
              position: [4.8, 1.05375, -18.15],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '179e08',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [-1.145192901774174e-8, 1.57079510506442, -7.808016642793961e-10],
              position: [7.7, 1.16497314, -17],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '569a1b',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [8.010253790075538e-9, 6.568184710953673e-8, -2.816469229869786e-9],
              position: [4.8, 1.05375, -17.4],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '8037ee',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [3.083060558756626e-8, 2.425645958237934e-7, 6.821726108303597e-9],
              position: [4.8, 1.05375, -17.15],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'be6eac',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [2.127503300171827e-8, 1.352528068534364e-7, -3.225271748991668e-9],
              position: [6, 1.05375, -18.65],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '4258fc',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [-4.161573540430792e-10, 2.975651251259643e-7, -4.180247533682872e-9],
              position: [6, 1.05375, -18.4],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'cc04c1',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [1.642825077168346e-8, 1.02194769837507e-7, 2.836869650458061e-9],
              position: [6, 1.05375, -17.15],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '0ac7cb',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [-1.434492569932372e-8, 1.570796326794897, 4.19479960029381e-10],
              position: [7.70000362, 1.16497326, -17.4999962],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '3c94b0',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [-1.427631855175707e-8, 1.570796326794897, 4.900506902709824e-8],
              position: [7, 1.16497314, -17.5],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'e450b4',
            name: 'City',
            model: { meshURL: '', colliderURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [1.68586344091793e-7, 1.570804529842381, 2.528817868110463e-7],
              position: [8.8, 1.24451518, -18.4999943],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '9649a4',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.99649936, 1, 0.9965063],
            transformation: {
              scale: [1, 1, 1],
              rotation: [6.817377219046525e-10, 6.919137419353577e-8, -8.14738153433122e-9],
              position: [34.9, 1.05375016, -17.15],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'f02479',
            name: 'City',
            model: { meshURL: '', colliderURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [-1.053673174761773e-7, 1.570795454130271, -4.00395027259589e-7],
              position: [8.8, 1.244515, -17.5],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'c090bf',
            name: 'City',
            model: { meshURL: '', colliderURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [1.475137797552816e-7, 1.570799293854625, 1.475141811810095e-7],
              position: [8.799999, 1.24451506, -18.0000019],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'd55405',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [8.84915964681539e-9, 1.570795628663196, 2.55655043433966e-9],
              position: [7.7, 1.16497314, -18],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '553bb7',
            name: 'Traders & Barbarians - Game Logic',
            model: { meshURL: '' },
            colorDiffuse: [0.552623332, 0.0599260852, 0.702090561],
            transformation: {
              scale: [0.2, 0.2, 0.2],
              rotation: [0, 1.570796326794897, 3.141592653589793],
              position: [-70, 130, 100],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '4edfbe',
            name: 'Settlement',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [-9.704841241806267e-10, 1.570793010669318, 4.237745171868383e-8],
              position: [7.00000048, 1.16497314, -17],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'f66474',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [2.915101381278244e-8, 3.209893076993693e-7, 1.615750248739739e-9],
              position: [4.8, 1.05375, -18.4],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: 'd05034',
            name: 'Road',
            model: { meshURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [4.000767350545613e-9, 7.473333509708712e-8, -7.429229580562883e-9],
              position: [6, 1.05375, -17.4],
            },
            mass: 1,
          },
          {
            type: 0,
            guid: '608cbc',
            name: 'City',
            model: { meshURL: '', colliderURL: '' },
            colorDiffuse: [0.7921569, 0, 0],
            transformation: {
              scale: [1, 1, 1],
              rotation: [1.053670239117971e-7, 1.570795977729046, -4.846887543201876e-7],
              position: [8.8, 1.244515, -17],
            },
            mass: 1,
          },
        ],
        leftHandedSystem: true,
      };

      const result = sim.toState();

      expect(sim.actors.length).toBe(initialState.actorStates?.length);
      expect(omitKeys(result, ['actorStates'])).toStrictEqual(omitKeys(expected, ['actorStates']));
      result.actorStates?.forEach(actorState => {
        const expectedActorState = expected.actorStates?.find(
          expectedActorState => expectedActorState.guid === actorState.guid,
        );
        expect(actorState).toEqual(expectedActorState);
      });
    });

    it('returns state save with rectangle table', async () => {
      const initialState: SimulationStateSave = {
        table: {
          url: 'https://example.com',
          type: 'Rectangle',
        },
        gravity: -9.8,
        actorStates: [],
        leftHandedSystem: false,
      };
      const sim = await Simulation.init(initialState);
      expect(sim.toState()).toEqual(initialState);
    });

    it('excludes empty actor states', async () => {
      const initialState: SimulationStateSave = {
        actorStates: [],
        leftHandedSystem: false,
        gravity: -9.8,
        table: {
          type: 'Rectangle',
          url: 'https://example.com',
        },
      };
      const sim = await Simulation.init(initialState);
      expect(sim.toState()).toEqual({
        actorStates: [],
        leftHandedSystem: false,
        gravity: -9.8,
        table: {
          type: 'Rectangle',
          url: 'https://example.com',
        },
      });
    });
  });

  describe('mergeStateDelta', () => {
    it('merges leftHandedSystem, gravity', () => {
      const state = { leftHandedSystem: false, gravity: 9.81 };
      const delta = { leftHandedSystem: true, gravity: 10 };
      const mergedState = Simulation.mergeStateDelta(state, delta);

      expect(mergedState.leftHandedSystem).toBe(true);
      expect(mergedState.gravity).toBe(10);
    });

    it('prioritizes delta actorStates', () => {
      const actorGuid = '123';
      const initialState = {
        actorStates: [{ type: 0, guid: actorGuid, name: 'zxc', model: { meshURL: '' }, position: [0, 0, 0] }],
      };
      const delta: SimulationStateUpdate = {
        actorStates: [{ guid: actorGuid, transformation: { position: [1, 2, 3] } }],
      };
      const mergedState = Simulation.mergeStateDelta(initialState, delta);
      expect(mergedState.actorStates![0].transformation?.position).toEqual([1, 2, 3]);
    });

    it('keeps unchanged actor states', () => {
      const actorGuid1 = '111';
      const actorGuid2 = '222';
      const initialState = {
        actorStates: [
          { type: 0, guid: actorGuid1, name: 'zxc', model: { meshURL: '' }, position: [1, 2, 3] },
          { type: 0, guid: actorGuid2, name: 'zxc', model: { meshURL: '' }, position: [4, 5, 6] },
        ],
      };
      const delta = { actorStates: [{ guid: actorGuid1, transformation: { position: [0, 0, 1] } }] };
      const mergedState = Simulation.mergeStateDelta(initialState, delta);

      expect(mergedState.actorStates![0].transformation?.position).toEqual([0, 0, 1]);
      expect(initialState.actorStates[0].position).toEqual([1, 2, 3]);
      expect(initialState.actorStates[1].position).toEqual([4, 5, 6]);
    });

    it('ignores missing actor states in delta', () => {
      const actorGuid = '123';
      const initialState = {
        actorStates: [{ type: 0, guid: 'unknown', name: 'zxc', model: { meshURL: '' }, position: [0, 0, 0] }],
      };
      const delta: SimulationStateUpdate = {
        actorStates: [{ guid: actorGuid, transformation: { position: [1, 2, 3] } }],
      };
      const mergedState = Simulation.mergeStateDelta(initialState, delta);
      // @todo make ActorState all fields required
      // expect(mergedState!.actorStates![0].transformation?.position).toEqual([0, 0, 0]);
      expect(mergedState.actorStates![0].transformation?.position).toEqual(undefined);
    });
  });
});
