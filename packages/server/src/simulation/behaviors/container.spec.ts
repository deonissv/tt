import { Matrix } from '@babylonjs/core';
import { can, Capability } from '@tt/rules';
import {
  ActorType,
  applyActorStateUpdate,
  type ActorState,
  type ActorStateUpdate,
  type BagState,
  type CardState,
  type DeckState,
  type TileStackState,
  type UnknownActorState,
} from '@tt/states';
import { Bag, Deck, TileStack, type ServerBase } from '../actors';
import { ServerActorBuilder } from '../serverActorBuilder';

const item = (guid: string): ActorState => ({
  type: ActorType.ACTOR,
  guid,
  name: guid,
  model: { meshURL: `${guid}.obj` },
});

const card = (guid: string): CardState => ({
  type: ActorType.CARD,
  guid,
  name: guid,
  faceURL: `${guid}-face.png`,
  backURL: `${guid}-back.png`,
  cols: 1,
  rows: 1,
  sequence: 0,
});

function actorWithState(state: BagState | DeckState): {
  actor: ServerBase & Pick<Bag, 'pickItem' | 'shuffle'>;
  updateState: ReturnType<typeof vi.fn>;
} {
  let live: BagState | DeckState = state;
  const updateState = vi.fn((update: ActorStateUpdate) => {
    live = applyActorStateUpdate(live, update) as BagState | DeckState;
  });
  const actor = {
    guid: state.guid,
    toState: () => structuredClone(live),
    updateState,
    transformation: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    model: { getWorldMatrix: () => Matrix.Identity(), scaling: { y: 0 } },
    scene: {
      getUniqueGUID: vi.fn((guid: string) => `${guid}-reserved`),
      releaseGUID: vi.fn(),
    },
  } as unknown as ServerBase & Pick<Bag, 'pickItem' | 'shuffle'>;
  Object.setPrototypeOf(actor, state.type === ActorType.BAG ? Bag.prototype : Deck.prototype);
  return { actor, updateState };
}

function stackActor(size: number, locked = false): ServerBase & Pick<Bag, 'pickItem'> {
  let nextGuid = 0;
  let state: TileStackState = {
    type: ActorType.TILE_STACK,
    guid: 'stack',
    name: 'Stack',
    tileType: 0,
    faceURL: 'face.png',
    size,
    locked,
  };
  const actor = {
    guid: state.guid,
    toState: () => structuredClone(state),
    updateState: (update: ActorStateUpdate) => {
      state = applyActorStateUpdate(state, update) as TileStackState;
    },
    transformation: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    model: { scaling: { y: size } },
    __collider: { scaling: { y: size } },
    _forceUpdate: vi.fn(),
    scene: {
      getUniqueGUID: vi.fn((guid?: string) => guid ?? `tile-${nextGuid++}`),
      releaseGUID: vi.fn(),
    },
  } as unknown as ServerBase & Pick<Bag, 'pickItem'>;
  Object.setPrototypeOf(actor, TileStack.prototype);
  return actor;
}

describe('actor container operations', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('derives a shuffled bag update without mutating the source state', () => {
    const state: BagState = {
      type: ActorType.BAG,
      guid: 'bag',
      name: 'Bag',
      containedObjects: [item('first'), item('second')],
    };
    const source = structuredClone(state);
    const { actor, updateState } = actorWithState(state);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    actor.shuffle();

    expect(updateState).toHaveBeenCalledWith({
      guid: state.guid,
      containedObjects: [item('second'), item('first')],
    });
    expect(state).toEqual(source);
  });

  it('keeps the drawn tile at the stack node scale', async () => {
    const actor = stackActor(5);
    const allocateGUID = vi.spyOn(actor.scene, 'getUniqueGUID');
    const releaseGUID = vi.spyOn(actor.scene, 'releaseGUID');
    const build = vi
      .spyOn(ServerActorBuilder, 'build')
      .mockResolvedValue({ picked: 'client', pick: vi.fn() } as unknown as ServerBase);

    await actor.pickItem('client', 1);

    expect(build.mock.calls[0][0]).toMatchObject({
      type: ActorType.TILE,
      transformation: { scale: [1, 1, 1], position: [0, 1, 0] },
    });
    expect(actor.toState()).toMatchObject({ size: 4 });
    expect(allocateGUID).toHaveBeenCalledTimes(1);
    expect(releaseGUID).toHaveBeenCalledWith(build.mock.calls[0][0].guid);
  });

  it('restores a tile when creation rejects', async () => {
    const actor = stackActor(3);
    vi.spyOn(ServerActorBuilder, 'build').mockRejectedValueOnce(new Error('asset unavailable'));

    await expect(actor.pickItem('client', 1)).rejects.toThrow('asset unavailable');

    expect(actor.toState()).toMatchObject({ size: 3 });
    expect(actor.model.scaling.y).toBe(3);
    expect(actor.__collider.scaling.y).toBe(3);
  });

  it.each(['bag', 'deck', 'stack'] as const)('draws an unlocked item from a locked %s', async kind => {
    const actor = stackActor(3, true);
    if (kind !== 'stack') {
      const child = { ...item('child'), locked: true };
      let state: BagState | DeckState =
        kind === 'bag'
          ? { type: ActorType.BAG, guid: 'bag', name: 'Bag', locked: true, containedObjects: [child] }
          : {
              type: ActorType.DECK,
              guid: 'deck',
              name: 'Deck',
              locked: true,
              cards: [
                {
                  ...child,
                  type: ActorType.CARD,
                  faceURL: 'face.png',
                  backURL: 'back.png',
                  rows: 1,
                  cols: 1,
                  sequence: 0,
                },
              ],
            };
      actor.toState = () => structuredClone(state);
      actor.updateState = update => {
        state = applyActorStateUpdate(state, update) as BagState | DeckState;
      };
      actor.model.getWorldMatrix = () => Matrix.Identity();
      Object.setPrototypeOf(actor, kind === 'bag' ? Bag.prototype : Deck.prototype);
    }
    const before = actor.toState() as UnknownActorState;
    const transformation = structuredClone(actor.transformation);
    const build = vi
      .spyOn(ServerActorBuilder, 'build')
      .mockResolvedValueOnce({ picked: 'client', pick: vi.fn() } as unknown as ServerBase);

    await actor.pickItem('client', 1);

    const drawn = build.mock.calls[0][0];
    expect(drawn.locked).toBe(false);
    expect(can(drawn, Capability.Pickable)).toBe(true);
    expect(actor.toState()).toMatchObject({ locked: true });
    expect(can(actor.toState() as UnknownActorState, Capability.Pickable)).toBe(false);
    expect(actor.transformation).toEqual(transformation);
    if (before.type === ActorType.BAG) expect(before.containedObjects[0].locked).toBe(true);
    if (before.type === ActorType.DECK) expect(before.cards[0].locked).toBe(true);
    if (kind === 'stack') expect(actor.toState()).toMatchObject({ size: 2 });
  });

  it('restores a tile when creation resolves without an actor', async () => {
    const actor = stackActor(3);
    vi.spyOn(ServerActorBuilder, 'build').mockResolvedValueOnce(null);

    await expect(actor.pickItem('client', 1)).resolves.toBeNull();

    expect(actor.toState()).toMatchObject({ size: 3 });
    expect(actor.model.scaling.y).toBe(3);
    expect(actor.__collider.scaling.y).toBe(3);
  });

  it('restores a bag item when creation resolves without an actor', async () => {
    const state: BagState = {
      type: ActorType.BAG,
      guid: 'bag',
      name: 'Bag',
      containedObjects: [item('first'), item('bad001')],
    };
    const { actor } = actorWithState(state);
    vi.spyOn(ServerActorBuilder, 'build').mockResolvedValueOnce(null);

    await expect(actor.pickItem('client', 1)).resolves.toBeNull();

    expect(actor.toState()).toEqual({
      type: ActorType.BAG,
      guid: 'bag',
      name: 'Bag',
      containedObjects: [item('first'), item('bad001')],
    });
  });

  it('restores a bag item when creation rejects', async () => {
    const state: BagState = {
      type: ActorType.BAG,
      guid: 'bag',
      name: 'Bag',
      containedObjects: [item('first'), item('bad001')],
    };
    const { actor } = actorWithState(state);
    vi.spyOn(ServerActorBuilder, 'build').mockRejectedValueOnce(new Error('asset unavailable'));

    await expect(actor.pickItem('client', 1)).rejects.toThrow('asset unavailable');

    expect(actor.toState()).toEqual({
      type: ActorType.BAG,
      guid: 'bag',
      name: 'Bag',
      containedObjects: [item('first'), item('bad001')],
    });
  });

  it('restores a deck card when creation resolves without an actor', async () => {
    const state: DeckState = {
      type: ActorType.DECK,
      guid: 'deck',
      name: 'Deck',
      cards: [card('bottom'), card('top')],
    };
    const { actor } = actorWithState(state);
    vi.spyOn(ServerActorBuilder, 'build').mockResolvedValueOnce(null);

    await expect(actor.pickItem('client', 1)).resolves.toBeNull();

    expect(actor.toState()).toEqual({ ...state, cards: [card('bottom'), card('top')] });
  });

  describe.each(['bag', 'face-up deck', 'face-down deck'] as const)('%s rollback ordering', kind => {
    it.each([
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ])('restores three failed draws completed in order %s, %s, %s', async (...completionOrder) => {
      const children = [card('bottom'), card('middle'), card('top')];
      const state: BagState | DeckState =
        kind === 'bag'
          ? { type: ActorType.BAG, guid: 'bag', name: 'Bag', containedObjects: children }
          : { type: ActorType.DECK, guid: 'deck', name: 'Deck', cards: children };
      const { actor } = actorWithState(state);
      actor.model.getWorldMatrix = () => (kind === 'face-down deck' ? Matrix.RotationX(Math.PI) : Matrix.Identity());
      const completions: ((actor: ServerBase | null) => void)[] = [];
      vi.spyOn(ServerActorBuilder, 'build').mockImplementation(
        () => new Promise<ServerBase | null>(resolve => completions.push(resolve)),
      );
      const draws = children.map(() => actor.pickItem('client', 1));

      for (const index of completionOrder) {
        completions[index](null);
        await expect(draws[index]).resolves.toBeNull();
      }

      expect(actor.toState()).toEqual(state);
      if (kind !== 'bag') expect(actor.model.scaling.y).toBe(children.length);
    });

    it('restores duplicate GUIDs when overlapping builds reject', async () => {
      const children = [card('same'), { ...card('same'), sequence: 1 }, { ...card('same'), sequence: 2 }];
      const state: BagState | DeckState =
        kind === 'bag'
          ? { type: ActorType.BAG, guid: 'bag', name: 'Bag', containedObjects: children }
          : { type: ActorType.DECK, guid: 'deck', name: 'Deck', cards: children };
      const { actor } = actorWithState(state);
      actor.model.getWorldMatrix = () => (kind === 'face-down deck' ? Matrix.RotationX(Math.PI) : Matrix.Identity());
      const releaseGUID = vi.spyOn(actor.scene, 'releaseGUID');
      const rejections: ((error: Error) => void)[] = [];
      vi.spyOn(ServerActorBuilder, 'build').mockImplementation(
        () => new Promise<ServerBase | null>((_, reject) => rejections.push(reject)),
      );
      const draws = children.map(() => expect(actor.pickItem('client', 1)).rejects.toThrow('asset unavailable'));
      // Rollback must use the draw's original position even if the deck flips.
      actor.model.getWorldMatrix = () => (kind === 'face-down deck' ? Matrix.Identity() : Matrix.RotationX(Math.PI));

      for (let index = 0; index < draws.length; index++) {
        rejections[index](new Error('asset unavailable'));
        await draws[index];
      }

      expect(actor.toState()).toEqual(state);
      expect(releaseGUID).toHaveBeenCalledTimes(children.length);
    });

    it.each([0, 1])('keeps a successful draw removed when draw %s fails', async failedIndex => {
      // Imported cards may share a GUID while carrying different card data.
      const children = [card('bottom'), { ...card('repeated'), sequence: 1 }, card('repeated')];
      const state: BagState | DeckState =
        kind === 'bag'
          ? { type: ActorType.BAG, guid: 'bag', name: 'Bag', containedObjects: children }
          : { type: ActorType.DECK, guid: 'deck', name: 'Deck', cards: children };
      const { actor } = actorWithState(state);
      actor.model.getWorldMatrix = () => (kind === 'face-down deck' ? Matrix.RotationX(Math.PI) : Matrix.Identity());
      const completions: ((actor: ServerBase | null) => void)[] = [];
      vi.spyOn(ServerActorBuilder, 'build').mockImplementation(
        () => new Promise<ServerBase | null>(resolve => completions.push(resolve)),
      );
      const draws = [actor.pickItem('client', 1), actor.pickItem('client', 1)];
      const spawned = { picked: 'client', pick: vi.fn() } as unknown as ServerBase;
      for (let index = 0; index < draws.length; index++) {
        const result = index === failedIndex ? null : spawned;
        completions[index](result);
        await expect(draws[index]).resolves.toBe(result);
      }

      const successfulIndex = 1 - failedIndex;
      const removedIndex = kind === 'face-down deck' ? successfulIndex : children.length - 1 - successfulIndex;
      const remaining = children.filter((_, index) => index !== removedIndex);
      expect(actor.toState()).toEqual({
        ...state,
        ...(kind === 'bag' ? { containedObjects: remaining } : { cards: remaining }),
      });
      if (kind !== 'bag') expect(actor.model.scaling.y).toBe(remaining.length);
    });
  });

  it('preserves a concurrent successful draw when another draw fails', async () => {
    const actor = stackActor(3);
    let rejectSpawn!: (reason: Error) => void;
    const pendingSpawn = new Promise<ServerBase | null>((_, reject) => {
      rejectSpawn = reject;
    });
    const spawned = { picked: 'client', pick: vi.fn() } as unknown as ServerBase;
    const build = vi
      .spyOn(ServerActorBuilder, 'build')
      .mockReturnValueOnce(pendingSpawn)
      .mockResolvedValueOnce(spawned);

    const failed = expect(actor.pickItem('client', 1)).rejects.toThrow('asset unavailable');
    await expect(actor.pickItem('client', 1)).resolves.toBe(spawned);
    expect(actor.toState()).toMatchObject({ size: 1 });
    await expect(actor.pickItem('client', 1)).resolves.toBeNull();
    expect(build).toHaveBeenCalledTimes(2);

    rejectSpawn(new Error('asset unavailable'));
    await failed;

    expect(actor.toState()).toMatchObject({ size: 2 });
    expect(actor.model.scaling.y).toBe(2);
    expect(actor.__collider.scaling.y).toBe(2);
  });
});
