import { CreateBox } from '@babylonjs/core';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { ActorType, type Die4State } from '@shared/dto/states';
import { Loader, SharedBase } from '@shared/playground';
import { DieMixin } from '@shared/playground/actors/DieMixin';
import { useSimulationMock } from './mocks/SimulationMock';

vi.mock('@shared/playground/Loader', async () => {
  const { LoaderMock } = await import('./mocks/LoaderMock');
  return {
    Loader: LoaderMock,
  };
});

describe('Die', () => {
  useSimulationMock();

  const Die4 = DieMixin<4>(SharedBase<Die4State>);

  let mesh: Mesh;
  let state: Die4State;

  beforeEach(() => {
    vi.restoreAllMocks();

    mesh = CreateBox('testMesh', { size: 1 });
    state = {
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
  });

  it('should construct with correct properties', () => {
    const die4 = new Die4(state, mesh);
    expect(die4 instanceof Die4).toBeTruthy();
  });

  it('fromState creates a Bag instance with correct properties', async () => {
    const die4 = await Die4.fromState(state);
    expect(die4 instanceof Die4).toBeTruthy();
  });

  it('fromState returns null if model is not loaded', async () => {
    vi.spyOn(Loader, 'loadModel').mockResolvedValue([null, null]);
    const die4 = await Die4.fromState(state);
    expect(die4 === null).toBeTruthy();
  });

  it('should construct using fromState value', async () => {
    const die4 = new Die4(state, mesh);
    expect(die4 instanceof Die4).toBeTruthy();

    const stateFromState = die4.toState();
    const newDie4 = await Die4.fromState(stateFromState);

    expect(newDie4 instanceof Die4).toBeTruthy();
  });
});
