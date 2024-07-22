import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateBox, HavokPlugin, NullEngine, Scene, Vector3 } from '@babylonjs/core';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { GRAVITY } from '@shared/constants';
import type { ActorStateBase, BagState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { Bag } from '@shared/playground/actors/Bag';
import { initHavok } from '@shared/utils';

vi.mock('@shared/playground/Loader', () => ({
  Loader: {
    loadMesh: () => Promise.resolve(CreateBox('testMesh', { size: 1 })),
  },
}));

describe('Bag', () => {
  let engine: NullEngine;
  let scene: Scene;
  let mesh: Mesh;
  let state: BagState;

  beforeAll(async () => {
    await initHavok();
  });

  beforeEach(() => {
    vi.restoreAllMocks();

    engine = new NullEngine();
    scene = new Scene(engine);
    const hp = new HavokPlugin(true, global.havok);
    const gravityVec = new Vector3(0, GRAVITY, 0);
    scene.enablePhysics(gravityVec, hp);

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
        } as ActorStateBase,
      ],
    };
  });

  it('should construct with correct properties', () => {
    const bag = new Bag(state, mesh);
    expect(bag).toBeInstanceOf(Bag);
  });

  it('fromState creates a Bag instance with correct properties', async () => {
    const bag = await Bag.fromState(state);
    expect(bag).toBeInstanceOf(Bag);
  });

  it('fromState returns null if model is not loaded', async () => {
    vi.spyOn(Loader, 'loadMesh').mockResolvedValue(null);
    const bag = await Bag.fromState(state);
    expect(bag).toBeNull();
  });

  it('should construct using fromState value', async () => {
    const bag = new Bag(state, mesh);
    expect(bag).toBeInstanceOf(Bag);

    const stateFromState = bag.toState();
    const newBag = await Bag.fromState(stateFromState);

    expect(newBag).toBeInstanceOf(Bag);
  });
});
