import { CreateBox, NullEngine, Scene } from '@babylonjs/core';
import { ActorType, type TileStackState } from '@tt/states';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TileStack } from './TileStack';

describe('tile stack size updates', () => {
  let engine: NullEngine;
  let scene: Scene;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
  });

  afterEach(() => {
    scene.dispose();
    engine.dispose();
  });

  it('renders the same height as a late joiner after extraction', () => {
    const state: TileStackState = {
      guid: 'stack',
      name: 'Stack',
      type: ActorType.TILE_STACK,
      tileType: 0,
      faceURL: 'face.png',
      size: 3,
    };
    const existing = new TileStack(state, CreateBox('existing', {}, scene));
    const lateJoiner = new TileStack({ ...state, size: 2 }, CreateBox('late', {}, scene));

    existing.rerenderStack(2);

    expect(existing.size).toBe(2);
    expect(existing.model.scaling.y).toBe(lateJoiner.model.scaling.y);
    expect(existing.toState().size).toBe(lateJoiner.toState().size);
  });
});
