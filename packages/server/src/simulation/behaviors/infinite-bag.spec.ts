import { CreateBox, Logger } from '@babylonjs/core';
import { ServerAction } from '@tt/actions';
import {
  ActorType,
  applyActorStateUpdate,
  type ActorState,
  type ActorStateUpdate,
  type BagState,
  type SimulationStateSave,
} from '@tt/states';
import { Loader } from '@tt/loader';
import { Logger as AppLogger } from '@tt/logger';
import { Client } from '../../rooms/client';
import { ActionBuilder } from '../../rooms/action-builder';
import { initHavok } from '../../utils';
import { getPhSim } from '../../../test/testUtils';
import { ActionHandler } from '../action-handler';
import { Actor, Bag, type ServerBase } from '../actors';
import { ServerActorBuilder } from '../serverActorBuilder';
import { SimulationFactory } from '../simulation.factory';
import type { Simulation } from '../simulation';

const item = (guid: string): ActorState => ({ type: ActorType.ACTOR, guid, name: guid, model: { meshURL: 'box.obj' } });
const bagState = (infinite = true): BagState => ({
  type: ActorType.BAG,
  guid: 'bag',
  name: 'Bag',
  infinite,
  containedObjects: [item('template')],
});

function fakeBag(initial: BagState): Bag {
  let state = structuredClone(initial);
  const actor = {
    guid: state.guid,
    scene: { getUniqueGUID: (guid: string) => guid, releaseGUID: vi.fn() },
    toState: () => structuredClone(state),
    updateState: (update: ActorStateUpdate) => {
      state = applyActorStateUpdate(state, update) as BagState;
    },
    transformation: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  } as unknown as Bag;
  Object.setPrototypeOf(actor, Bag.prototype);
  return actor;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('bag draw reservations', () => {
  afterEach(() => vi.restoreAllMocks());

  it('refreshes all nested identities before concurrent builds and leaves templates untouched', async () => {
    const state = bagState();
    state.containedObjects = [
      {
        ...bagState(false),
        guid: 'nested-bag',
        children: [{ ...item('child'), children: [item('grandchild')] }],
        containedObjects: [
          {
            type: ActorType.DECK,
            guid: 'deck',
            name: 'Deck',
            cards: [
              {
                type: ActorType.CARD,
                guid: 'card',
                name: 'Card',
                faceURL: 'face',
                backURL: 'back',
                rows: 1,
                cols: 1,
                sequence: 0,
              },
            ],
          },
        ],
      },
    ];
    const actor = fakeBag(state);
    const pending = deferred<ServerBase | null>();
    const build = vi.spyOn(ServerActorBuilder, 'build').mockReturnValue(pending.promise);
    const draws = [actor.pickItem('alice', 1), actor.pickItem('bob', 2)];
    const copies = build.mock.calls.map(([copy]) => copy as BagState);
    const identities = copies.flatMap(copy => [
      copy.guid,
      copy.children![0].guid,
      copy.children![0].children![0].guid,
      copy.containedObjects[0].guid,
      (copy.containedObjects[0] as { cards: { guid: string }[] }).cards[0].guid,
    ]);
    expect(new Set(identities).size).toBe(10);
    expect(identities.some(guid => ['nested-bag', 'child', 'grandchild', 'deck', 'card'].includes(guid))).toBe(false);
    copies[0].children![0].name = 'changed';
    copies[0].containedObjects.length = 0;
    pending.resolve(null);
    await Promise.all(draws);
    expect(actor.toState()).toEqual(state);
  });

  it.each([true, false])('keeps empty bags inert, infinite=%s', async infinite => {
    const actor = fakeBag({ ...bagState(infinite), containedObjects: [] });
    const build = vi.spyOn(ServerActorBuilder, 'build');
    await expect(actor.pickItem('alice', 1)).resolves.toBeNull();
    expect(build).not.toHaveBeenCalled();
  });

  it.each([true, false])('retains original contents on null and rejected builds, infinite=%s', async infinite => {
    const state = { ...bagState(infinite), containedObjects: [item('first'), item('last')] };
    const actor = fakeBag(state);
    const build = vi
      .spyOn(ServerActorBuilder, 'build')
      .mockImplementationOnce(copy => {
        copy.name = 'builder mutation';
        return Promise.resolve(null);
      })
      .mockRejectedValueOnce(new Error('asset unavailable'));
    await expect(actor.pickItem('alice', 1)).resolves.toBeNull();
    expect(actor.toState()).toEqual(state);
    await expect(actor.pickItem('bob', 1)).rejects.toThrow('asset unavailable');
    expect(actor.toState()).toEqual(state);
    expect(build).toHaveBeenCalledTimes(2);
  });

  it.each(['null', 'reject'] as const)('restores only the failed finite reservation on %s', async failure => {
    const actor = fakeBag({ ...bagState(false), containedObjects: [item('first'), item('last')] });
    const pending = deferred<ServerBase | null>();
    const spawned = { picked: 'bob', pick: vi.fn() } as unknown as ServerBase;
    const build = vi
      .spyOn(ServerActorBuilder, 'build')
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(spawned);
    const first = actor.pickItem('alice', 1);
    const checked =
      failure === 'reject' ? expect(first).rejects.toThrow('unavailable') : expect(first).resolves.toBeNull();
    await expect(actor.pickItem('bob', 1)).resolves.toBe(spawned);
    await expect(actor.pickItem('charlie', 1)).resolves.toBeNull();
    expect(build.mock.calls.map(([state]) => state.guid)).toEqual(['last', 'first']);
    if (failure === 'reject') pending.reject(new Error('unavailable'));
    else pending.resolve(null);
    await checked;
    expect(actor.toState()).toMatchObject({ containedObjects: [item('last')] });
  });

  it('retains the infinite template when a pending draw fails after another succeeds', async () => {
    const state = bagState();
    const actor = fakeBag(state);
    const pending = deferred<ServerBase | null>();
    const pick = vi.fn();
    const spawned = { pick } as unknown as ServerBase;
    const released = vi.spyOn(actor.scene, 'releaseGUID');
    const build = vi
      .spyOn(ServerActorBuilder, 'build')
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(spawned);
    const failed = expect(actor.pickItem('alice', 1)).rejects.toThrow('asset unavailable');
    await expect(actor.pickItem('bob', 2)).resolves.toBe(spawned);
    pending.reject(new Error('asset unavailable'));
    await failed;
    expect(build.mock.calls[0][0].guid).not.toBe(build.mock.calls[1][0].guid);
    expect(pick).toHaveBeenCalledWith('bob', 2);
    expect(actor.toState()).toEqual(state);
    expect(released).toHaveBeenCalledTimes(2);
  });
});

describe('infinite bags in a server simulation', () => {
  let sim: Simulation;
  beforeAll(async () => {
    Logger.LogLevels = 0;
    await initHavok();
  });
  beforeEach(() => {
    vi.spyOn(ServerActorBuilder, 'buildActor').mockImplementation(state =>
      Promise.resolve(new Actor(state, CreateBox(state.guid))),
    );
    vi.spyOn(Loader, 'loadMesh').mockImplementation(() => Promise.resolve(CreateBox('bag-model')));
    sim = getPhSim();
  });
  afterEach(() => {
    sim.stop();
    sim.scene.dispose();
    sim.engine.dispose();
    vi.restoreAllMocks();
  });

  it('draws simultaneously for two players and broadcasts distinct owned copies', async () => {
    const bag = new Bag(bagState(), CreateBox('bag'));
    const before = structuredClone(sim.toState());
    const [aliceCopy, bobCopy] = await Promise.all([bag.pickItem('alice', 1), bag.pickItem('bob', 2)]);
    expect(aliceCopy!.guid).not.toBe(bobCopy!.guid);
    expect(aliceCopy!.picked).toBe('alice');
    expect(bobCopy!.picked).toBe('bob');
    expect(bag.toState().containedObjects).toEqual(bagState().containedObjects);
    const builder = new ActionBuilder();
    builder.sim = sim;
    builder.prevSimState = before;
    const actions = builder.getSimActions(sim.toState());
    for (const copy of [aliceCopy!, bobCopy!]) {
      expect(
        actions.find(
          action => action.type === ServerAction.SPAWN_PICKED_ACTOR && action.payload.state.guid === copy.guid,
        ),
      ).toMatchObject({
        type: ServerAction.SPAWN_PICKED_ACTOR,
        payload: { clientId: copy.picked, state: { guid: copy.guid } },
      });
    }
    expect(actions.filter(action => action.type === ServerAction.SPAWN_PICKED_ACTOR)).toHaveLength(2);
    expect(builder.getSimActions(sim.toState())).toEqual([]);
    const handler = new ActionHandler();
    handler.actors = sim.actors;
    handler.client = new Client({ code: 'bob', roleId: 1, userId: 2, username: 'Bob' });
    handler.handleReleaseActor(aliceCopy!.guid);
    expect(aliceCopy!.picked).toBe('alice');
    handler.handleReleaseActor(bobCopy!.guid);
    expect(bobCopy!.picked).toBeNull();
  });

  it('contains a failed player draw and allows a later player to retry', async () => {
    const bag = new Bag(bagState(), CreateBox('bag'));
    const error = new Error('asset unavailable');
    const logged = vi.spyOn(AppLogger, 'error').mockImplementation(vi.fn());
    vi.spyOn(ServerActorBuilder, 'buildActor').mockRejectedValueOnce(error);
    const handler = new ActionHandler();
    handler.actors = sim.actors;
    handler.client = new Client({ code: 'alice', roleId: 1, userId: 1, username: 'Alice' });
    await expect(handler.handlePickItem(bag.guid)).resolves.toBeUndefined();
    expect(logged).toHaveBeenCalledWith('Failed to draw from container bag', error);
    expect(sim.actors).toHaveLength(1);
    expect(bag.toState().containedObjects).toEqual(bagState().containedObjects);
    handler.client = new Client({ code: 'bob', roleId: 1, userId: 2, username: 'Bob' });
    await handler.handlePickItem(bag.guid);
    expect(sim.actors).toHaveLength(2);
    expect(sim.actors.find(actor => actor.guid !== bag.guid)!.picked).toBe('bob');
  });

  it('preserves the flag and template through JSON save, reload and further draws', async () => {
    const bag = new Bag(bagState(), CreateBox('bag'));
    await bag.pickItem('alice', 1);
    const saved = JSON.parse(JSON.stringify(sim.toState())) as SimulationStateSave;
    const previousGUIDs = saved.actorStates!.map(state => state.guid);
    sim.scene.dispose();
    sim.engine.dispose();
    sim = await new SimulationFactory().create(saved);
    const restored = sim.actors.find(actor => actor.guid === bag.guid) as Bag;
    expect(restored.toState()).toMatchObject({ infinite: true, containedObjects: bagState().containedObjects });
    const copy = await restored.pickItem('bob', 2);
    expect(previousGUIDs).not.toContain(copy!.guid);
    expect(copy!.picked).toBe('bob');
    expect(restored.size).toBe(1);
    expect(sim.toState().actorStates).toHaveLength(3);
  });
});
