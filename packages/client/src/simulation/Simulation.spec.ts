/* eslint-disable @typescript-eslint/dot-notation -- Bracket access lets these tests exercise private event handlers. */
import {
  CreateBox,
  KeyboardInfo,
  KeyboardEventTypes,
  NullEngine,
  PickingInfo,
  PointerEventTypes,
  PointerInfo,
  Scene,
} from '@babylonjs/core';
import type { SimulationSceneBase } from '@tt/simulation';
import { ActorType } from '@tt/states';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PICK_ITEM_KEYS } from '../config';
import { Simulation, type SimulationCallbacks } from './Simulation';
import { ClientBase, type Deck } from './actors';

describe('locked object hover and targeting', () => {
  let engine: NullEngine;
  let scene: Scene;
  let simulation: Simulation;
  let callbacks: SimulationCallbacks;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
    callbacks = {
      onPickItem: vi.fn(),
      onPickActor: vi.fn(),
      onReleaseActor: vi.fn(),
      onMoveActor: vi.fn(),
      onRoll: vi.fn(),
      onShuffle: vi.fn(),
      onFlip: vi.fn(),
      onCW: vi.fn(),
      onCCW: vi.fn(),
    };
    simulation = new Simulation(scene as SimulationSceneBase, callbacks);
    simulation['_handleHoverHighlight']();
    simulation['_handlePick']();
    simulation['_bindAction'](PICK_ITEM_KEYS, actor => callbacks.onPickItem(actor as Deck));
    vi.spyOn(simulation, 'getCursor').mockReturnValue([0, 0]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    scene.dispose();
    engine.dispose();
  });

  function target(type: ActorType, locked: boolean): ClientBase {
    const actor = new ClientBase({ guid: 'target', name: 'Target', type, locked }, CreateBox('target', {}, scene));
    const picking = new PickingInfo();
    picking.pickedMesh = actor.__model;
    vi.spyOn(scene, 'pick').mockReturnValue(picking);
    return actor;
  }

  function hover(): void {
    scene.onPointerObservable.notifyObservers(new PointerInfo(PointerEventTypes.POINTERMOVE, {} as PointerEvent, null));
  }

  it.each([ActorType.ACTOR, ActorType.BAG, ActorType.DECK, ActorType.TILE_STACK])(
    'does not outline a locked %s on hover',
    type => {
      target(type, true);
      const highlight = vi.spyOn(simulation['_hll'], 'addMesh');

      hover();

      expect(highlight).not.toHaveBeenCalled();
    },
  );

  it('clears the previous outline when the pointer enters a locked object', () => {
    const actor = target(ActorType.ACTOR, false);
    const highlight = vi.spyOn(simulation['_hll'], 'addMesh');
    const unhighlight = vi.spyOn(simulation['_hll'], 'removeMesh');
    hover();
    expect(highlight).toHaveBeenCalledWith(actor.__model, expect.anything(), false);

    target(ActorType.BAG, true);
    hover();

    expect(unhighlight).toHaveBeenCalledWith(actor.__model);
    expect(highlight).toHaveBeenCalledTimes(1);
  });

  it('still targets a locked bag for drawing while preventing a grab', () => {
    const bag = target(ActorType.BAG, true);
    hover();

    scene.onKeyboardObservable.notifyObservers(
      new KeyboardInfo(KeyboardEventTypes.KEYDOWN, { code: PICK_ITEM_KEYS[0] } as KeyboardEvent),
    );
    scene.onPointerObservable.notifyObservers(
      new PointerInfo(PointerEventTypes.POINTERDOWN, { button: 0 } as PointerEvent, null),
    );

    expect(callbacks.onPickItem).toHaveBeenCalledWith(bag);
    expect(callbacks.onPickActor).not.toHaveBeenCalled();
  });
});
