import { CreateBox, Mesh, NullEngine } from '@babylonjs/core';
import { ClientBase } from '@client/src/simulation/actors';
import { ActorType } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import type { SimulationCallbacks } from '../src/simulation/Simulation';
import { Simulation } from '../src/simulation/Simulation';
import { SimulationScene } from '../src/simulation/SimulationScene';

function getSim(cbs: Partial<SimulationCallbacks> = {}): Simulation {
  const _cbs = {
    onPickItem: cbs.onPickItem ?? vi.fn(),
    onMoveActor: cbs.onMoveActor ?? vi.fn(),
    onPickActor: cbs.onPickActor ?? vi.fn(),
    onReleaseActor: cbs.onReleaseActor ?? vi.fn(),
  };
  const engine = new NullEngine();
  const scene = new SimulationScene(engine);
  return new Simulation(scene, _cbs);
}

describe('Simulation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(Loader, 'loadModel').mockImplementation(() => {
      return Promise.resolve([new Mesh('testMesh'), null]);
    });
    vi.spyOn(Loader, 'loadMesh').mockImplementation(() => {
      return Promise.resolve(new Mesh('testMesh'));
    });
  });

  it('should create a new simulation', () => {
    const sim = getSim();
    expect(sim).toBeDefined();
  });

  describe('actions', () => {
    it('should handle move actor', () => {
      const sim = getSim();

      const actor = new ClientBase(
        {
          type: ActorType.ACTOR,
          guid: 'box',
          name: 'box',
          transformation: { position: [0, 1, 0] },
        },
        CreateBox('testBox'),
      );

      sim.handleMoveActor('box', [1, 2, 3]);

      const state = actor.toState();
      expect(state.transformation.position).toEqual([1, 2, 3]);
    });
  });
});
