import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateBox } from '@babylonjs/core';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { ActorBaseState, BagState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { Bag } from '@shared/playground/actors/Bag';
import { useSimulationMock } from './mocks/SimulationMock';

vi.mock('@shared/playground/Loader', async () => {
  const { LoaderMock } = await import('./mocks/LoaderMock');
  return {
    Loader: LoaderMock,
  };
});

describe('Bag', () => {
  const { scene } = useSimulationMock();

  let mesh: Mesh;
  let state: BagState;

  beforeEach(() => {
    vi.restoreAllMocks();
    mesh = CreateBox('testMesh', { size: 1 }, scene);

    state = {
      type: 1,
      guid: '1234',
      name: 'testActor',
      transformation: {
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
        position: [0, 0, 0],
      },
      containedObjects: [
        {
          type: 2,
          guid: '1234',
          name: 'testActor',
          transformation: {
            scale: [1, 1, 1],
            rotation: [0, 0, 0],
            position: [0, 0, 0],
          },
          faceURL: '',
          backURL: '',
          rows: 1,
          cols: 1,
          sequence: 0,
        } as ActorBaseState,
      ],
    };
  });

  it('should construct with correct properties', () => {
    const bag = new Bag(state, mesh);
    expect(bag instanceof Bag).toBeTruthy();
  });

  it('fromState creates a Bag instance with correct properties', async () => {
    const bag = await Bag.fromState(state);
    expect(bag instanceof Bag).toBeTruthy();
  });

  it('fromState returns null if model is not loaded', async () => {
    vi.spyOn(Loader, 'loadModel').mockResolvedValue([null, null]);
    const bag = await Bag.fromState(state);
    expect(bag == null).toBeTruthy();
  });

  it('should construct using fromState value', async () => {
    const bag = new Bag(state, mesh);
    expect(bag instanceof Bag).toBeTruthy();

    const stateFromState = bag.toState();
    const newBag = await Bag.fromState(stateFromState);

    expect(newBag instanceof Bag).toBeTruthy();
  });
});
