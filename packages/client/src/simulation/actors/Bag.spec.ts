import { CreateBox, NullEngine, Scene } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { ActorType, type BagState, type UnknownActorState } from '@tt/states';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Bag } from './Bag';

const bagItem = (guid: string): UnknownActorState => ({
  type: ActorType.ACTOR,
  guid,
  name: guid,
  model: { meshURL: `${guid}.obj` },
});

describe('client bag snapshots', () => {
  let engine: NullEngine;
  let scene: Scene;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    scene.dispose();
    engine.dispose();
  });

  it.each([
    ['extraction', [bagItem('first')]],
    ['shuffle', [bagItem('second'), bagItem('first')]],
    ['final extraction', []],
  ])('adopts %s into its serialized state', async (_, remaining) => {
    vi.spyOn(Loader, 'loadModel').mockResolvedValue([CreateBox('bag', {}, scene), null]);
    const state: BagState = {
      guid: 'bag',
      name: 'Bag',
      type: ActorType.BAG,
      containedObjects: [bagItem('first'), bagItem('second')],
    };
    const bag = await Bag.fromState(state);
    expect(bag).toBeInstanceOf(Bag);

    bag!.rerenderBag(remaining);

    expect(bag!.toState().containedObjects).toEqual(remaining);
  });
});
