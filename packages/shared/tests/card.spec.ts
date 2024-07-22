import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateBox, HavokPlugin, NullEngine, Scene, Texture, Vector3 } from '@babylonjs/core';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { GRAVITY } from '@shared/constants';
import type { CardState } from '@shared/dto/states';
import { Card } from '@shared/playground/';
import { initHavok } from './testUtils';

vi.mock('@shared/playground/Loader', () => ({
  Loader: {
    loadMesh: () => Promise.resolve(CreateBox('testMesh', { size: 1 })),
    loadTexture: () => Promise.resolve(new Texture('testTexture')),
  },
}));

describe('Card', () => {
  let engine: NullEngine;
  let scene: Scene;
  let mesh: Mesh;
  let texture: Texture;
  let state: CardState;

  beforeAll(async () => {
    await initHavok();
  });

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(Card, 'getCardModel').mockImplementation(() => {
      return CreateBox('testMesh', { size: 1 }, scene);
    });

    engine = new NullEngine();
    scene = new Scene(engine);
    const hp = new HavokPlugin(true, global.havok);
    const gravityVec = new Vector3(0, GRAVITY, 0);
    scene.enablePhysics(gravityVec, hp);

    mesh = CreateBox('testMesh', { size: 1 }, scene);
    texture = new Texture('testTexture', scene);

    state = {
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
    };
  });
  it('should construct with correct properties', () => {
    const card = new Card(state, mesh, texture, texture);
    expect(card).toBeInstanceOf(Card);
  });

  it('fromState creates a Card instance with correct properties', async () => {
    const card = await Card.fromState(state);
    expect(card).toBeInstanceOf(Card);
  });

  it('fromState returns null if card model is not loaded', async () => {
    vi.spyOn(Card, 'loadCardModel').mockResolvedValue(null);
    const card = await Card.fromState(state);
    expect(card).toBeNull();
  });

  it('should construct using fromState value', async () => {
    const card = new Card(state, mesh, texture, texture);
    expect(card).toBeInstanceOf(Card);

    const stateFromState = card.toState();
    const newCard = await Card.fromState(stateFromState);

    expect(newCard).toBeInstanceOf(Card);
  });
});
