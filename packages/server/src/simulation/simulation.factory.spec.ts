/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/dot-notation */
import { Logger, Mesh, Scene } from '@babylonjs/core';

import { Loader } from '@tt/loader';
import { type ActorState } from '@tt/states';
import { initHavok } from '../utils';
import { Actor } from './actors';
import { SimulationFactory } from './simulation.factory';

describe('SimulationFactory', () => {
  const factory = new SimulationFactory();

  beforeAll(async () => {
    Logger.LogLevels = 0;

    await initHavok();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(Loader, 'loadModel').mockImplementation(() => {
      return Promise.resolve([new Mesh('testMesh'), null]);
    });
    vi.spyOn(Loader, 'loadMesh').mockImplementation(() => {
      return Promise.resolve(new Mesh('testMesh'));
    });
  });

  describe('create', () => {
    it('creates a scene and applies the left handed system flag', async () => {
      const initialState = { leftHandedSystem: false };
      const sim = await factory.create(initialState, vi.fn());

      expect(sim['scene'] instanceof Scene).toBe(true);
      expect(sim['scene'].useRightHandedSystem).toBe(true);

      const leftHandedState = { leftHandedSystem: true };
      const sim2 = await factory.create(leftHandedState, vi.fn());
      expect(sim2['scene'].useRightHandedSystem).toBe(false);
    });

    it('calls onModelLoaded for each loaded actor', async () => {
      const mockOnModelLoaded = vi.fn();
      const initialState: { actorStates: ActorState[] } = {
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
      await factory.create(initialState, mockOnModelLoaded);

      expect(mockOnModelLoaded).toHaveBeenCalledTimes(2);
    });

    it('calls onSucceed for successfully loaded actors', async () => {
      const mockOnSucceed = vi.fn();
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
      vi.spyOn(Actor, 'fromState').mockImplementation((state: ActorState) => {
        return Promise.resolve(new Actor(state, new Mesh('testMesh')));
      });

      await factory.create(initialState, vi.fn(), mockOnSucceed);

      expect(mockOnSucceed).toHaveBeenCalledTimes(1);
    });

    it('calls onFailed for failed actors', async () => {
      const mockOnFailed = vi.fn();
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
      vi.spyOn(Loader, 'loadModel').mockReturnValueOnce(Promise.resolve([null, null]));
      vi.spyOn(Actor, 'fromState').mockReturnValueOnce(Promise.resolve(null));
      await factory.create(initialState, vi.fn(), vi.fn(), mockOnFailed);

      expect(mockOnFailed).toHaveBeenCalledTimes(1);
    });
  });
});
