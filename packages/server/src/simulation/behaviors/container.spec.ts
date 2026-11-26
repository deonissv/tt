import { useActorFixtures } from '../../../test/actor-fixtures';
import { Matrix } from '@babylonjs/core';
import { can, Capability } from '@tt/rules';
import { ActorType, type ActorState, type BagState, type CardState, type DeckState } from '@tt/states';
import type { TileStack, ServerBase } from '../actors';
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

const fixtures = useActorFixtures();

function actorWithState(state: BagState | DeckState) {
  const actor = state.type === ActorType.BAG ? fixtures.bag(state) : fixtures.deck(state);
  return { actor, updateState: vi.spyOn(actor, 'updateState') };
}

function stackActor(size: number, locked = false): TileStack {
  return fixtures.stack({
    type: ActorType.TILE_STACK,
    guid: 'stack',
    name: 'Stack',
    tileType: 0,
    faceURL: 'face.png',
    size,
    locked,
  });
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
    const build = vi.spyOn(ServerActorBuilder, 'build').mockResolvedValue(fixtures.spawned());

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
    const child = { ...item('child'), locked: true };
    const actor =
      kind === 'stack'
        ? stackActor(3, true)
        : actorWithState(
            kind === 'bag'
              ? { type: ActorType.BAG, guid: 'bag', name: 'Bag', locked: true, containedObjects: [child] }
              : {
                  type: ActorType.DECK,
                  guid: 'deck',
                  name: 'Deck',
                  locked: true,
                  cards: [{ ...card('child'), locked: true }],
                },
          ).actor;
    const before = actor.__state;
    const transformation = structuredClone(actor.transformation);
    const build = vi.spyOn(ServerActorBuilder, 'build').mockResolvedValueOnce(fixtures.spawned());

    await actor.pickItem('client', 1);

    const drawn = build.mock.calls[0][0];
    expect(drawn.locked).toBe(false);
    expect(can(drawn, Capability.Pickable)).toBe(true);
    expect(actor.__state).toMatchObject({ locked: true });
    expect(can(actor.__state, Capability.Pickable)).toBe(false);
    expect(actor.transformation).toEqual(transformation);
    if (before.type === ActorType.BAG) expect(before.containedObjects[0].locked).toBe(true);
    if (before.type === ActorType.DECK) expect(before.cards[0].locked).toBe(true);
    if (kind === 'stack') expect(actor.__state).toMatchObject({ size: 2 });
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

    expect(actor.__state).toEqual({
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

    expect(actor.__state).toEqual({
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

    expect(actor.__state).toEqual({ ...state, cards: [card('bottom'), card('top')] });
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

      expect(actor.__state).toEqual(state);
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

      expect(actor.__state).toEqual(state);
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
      const spawned = fixtures.spawned();
      for (let index = 0; index < draws.length; index++) {
        const result = index === failedIndex ? null : spawned;
        completions[index](result);
        await expect(draws[index]).resolves.toBe(result);
      }

      const successfulIndex = 1 - failedIndex;
      const removedIndex = kind === 'face-down deck' ? successfulIndex : children.length - 1 - successfulIndex;
      const remaining = children.filter((_, index) => index !== removedIndex);
      expect(actor.__state).toEqual({
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
    const spawned = fixtures.spawned();
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
