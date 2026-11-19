import type { CursorsPld, MsgMap } from '@tt/actions';
import { ServerAction } from '@tt/actions';
import {
  ActorType,
  type ActorState,
  type BagState,
  type UnknownActorState,
  type DeckState,
  type SimulationStateSave,
  type TileStackState,
} from '@tt/states';
import { ActionBuilder } from './action-builder';

const actorState = (overrides: Partial<ActorState> = {}): ActorState => ({
  guid: 'actor',
  name: 'Actor',
  type: ActorType.ACTOR,
  model: { meshURL: '' },
  transformation: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  ...overrides,
});

const card = (faceURL: string): DeckState['cards'][number] => ({
  guid: `card-${faceURL}`,
  name: `Card ${faceURL}`,
  type: ActorType.CARD,
  faceURL,
  backURL: `${faceURL}-back`,
  cols: 1,
  rows: 1,
  sequence: 0,
});

const deck = (cards: DeckState['cards']): DeckState => ({
  guid: 'deck',
  name: 'Deck',
  type: ActorType.DECK,
  cards,
});

const makeBuilder = (actors: { guid: string; picked?: string }[] = []): ActionBuilder => {
  const builder = new ActionBuilder();
  builder.sim = { actors } as unknown as typeof builder.sim;
  return builder;
};

it('broadcasts a tile stack size change to players already in the room', () => {
  const stack: TileStackState = {
    guid: 'stack',
    name: 'Stack',
    type: ActorType.TILE_STACK,
    tileType: 0,
    faceURL: 'face.png',
    size: 3,
  };
  const builder = makeBuilder();
  builder.prevSimState = { actorStates: [stack] };

  expect(builder.getSimActions({ actorStates: [{ ...stack, size: 2 }] })).toContainEqual({
    type: 'RERENDER_TILE_STACK',
    payload: { guid: 'stack', size: 2 },
  });
});

describe('empty deck rerender', () => {
  const before = deck([card('face.png')]);

  it('emits a zero-size rerender when the final card is drawn', () => {
    expect(new ActionBuilder().getDeckRerender(before, { ...before, cards: [] })).toEqual({
      guid: 'deck',
      grid: { faceURL: 'face.png', backURL: 'face.png-back', cols: 1, rows: 1, sequence: 0 },
      size: 0,
      cards: [],
    });
  });

  it('delivers the new card order so client snapshots stay in sync', () => {
    const remaining: DeckState['cards'] = [
      {
        guid: 'mid',
        name: 'mid',
        type: ActorType.CARD,
        faceURL: 'm.png',
        backURL: 'm.png',
        cols: 1,
        rows: 1,
        sequence: 0,
      },
    ];
    const beforeDraw: DeckState = { ...before, cards: [...remaining, { ...before.cards[0], guid: 'drawn' }] };
    const afterDraw: DeckState = { ...before, cards: remaining };

    expect(new ActionBuilder().getDeckRerender(beforeDraw, afterDraw)).toEqual({
      guid: 'deck',
      grid: { faceURL: 'm.png', backURL: 'm.png', cols: 1, rows: 1, sequence: 0 },
      size: 1,
      cards: remaining,
    });
  });

  it('does not rerender an unchanged empty deck', () => {
    const empty = { ...before, cards: [] };
    expect(new ActionBuilder().getDeckRerender(empty, empty)).toBeNull();
  });

  it.each(['shuffle', 'extract'] as const)('delivers an interior %s with unchanged end cards', operation => {
    const cards = ['bottom', 'middle-a', 'middle-b', 'top'].map(guid => ({ ...before.cards[0], guid }));
    const nextCards =
      operation === 'shuffle' ? [cards[0], cards[2], cards[1], cards[3]] : [cards[0], cards[2], cards[3]];
    const builder = new ActionBuilder();
    builder.sim = { actors: [] } as unknown as typeof builder.sim;
    builder.prevSimState = { actorStates: [{ ...before, cards }] };

    const actions = builder.getSimActions({ actorStates: [{ ...before, cards: nextCards }] });

    expect(actions).toEqual([
      {
        type: ServerAction.RERENDER_DECK,
        payload: {
          guid: 'deck',
          grid: { faceURL: 'face.png', backURL: 'face.png-back', cols: 1, rows: 1, sequence: 0 },
          size: nextCards.length,
          cards: nextCards,
        },
      },
    ]);
    const payload = (actions[0] as MsgMap[ServerAction.RERENDER_DECK]).payload;
    expect(payload.cards).not.toBe(nextCards);
    expect(builder.getSimActions({ actorStates: [{ ...before, cards: nextCards }] })).toEqual([]);
  });
});

describe('getDeckRerender', () => {
  it('does not rerender non-deck actors', () => {
    expect(
      new ActionBuilder().getDeckRerender(actorState() as unknown as DeckState, actorState() as unknown as DeckState),
    ).toBeNull();
  });

  it('rerenders when the top card changes', () => {
    const prev = deck([card('back1'), card('face1')]);
    const current = deck([card('back1'), card('face2')]);

    const payload = new ActionBuilder().getDeckRerender(prev, current);

    expect(payload).toMatchObject({
      guid: 'deck',
      size: 2,
      grid: { faceURL: 'face2', backURL: 'back1-back' },
    });
  });

  it('rerenders when the bottom card changes', () => {
    const prev = deck([card('back1'), card('face1')]);
    const current = deck([card('back2'), card('face1')]);

    expect(new ActionBuilder().getDeckRerender(prev, current)).toMatchObject({ guid: 'deck', size: 2 });
  });

  it('does not rerender when neither end card changed', () => {
    const prev = deck([card('back1'), card('face1')]);

    expect(new ActionBuilder().getDeckRerender(prev, { ...prev })).toBeNull();
  });
});

describe('getCursorsAction', () => {
  it('returns null for an empty cursor payload', () => {
    expect(new ActionBuilder().getCursorsAction({})).toBeNull();
  });

  it('broadcasts new cursors, then suppresses identical repeats', () => {
    const builder = new ActionBuilder();
    const cursors: CursorsPld = { 'client-1': [1, 2] };

    expect(builder.getCursorsAction(cursors)).toEqual({ type: ServerAction.CURSORS, payload: cursors });
    expect(builder.getCursorsAction({ 'client-1': [1, 2] })).toBeNull();
    expect(builder.getCursorsAction({ 'client-1': [3, 4] })).toEqual({
      type: ServerAction.CURSORS,
      payload: { 'client-1': [3, 4] },
    });
  });
});

describe('getActions', () => {
  it('returns null when neither cursors nor simulation changed', () => {
    expect(new ActionBuilder().getActions({}, { actorStates: [] })).toBeNull();
  });

  it('combines the cursors message with the simulation actions', () => {
    const builder = makeBuilder();
    builder.prevSimState = { actorStates: [actorState()] };

    const actions = builder.getActions(
      { 'client-1': [1, 2] },
      { actorStates: [actorState({ transformation: { position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1] } })] },
    );

    expect(actions).toEqual([
      { type: ServerAction.CURSORS, payload: { 'client-1': [1, 2] } },
      { type: ServerAction.MOVE_ACTOR, payload: { guid: 'actor', position: [1, 2, 3] } },
    ]);
  });
});

describe('getSimActions', () => {
  it('treats the first observed state as the baseline and emits nothing', () => {
    const builder = new ActionBuilder();
    const state: SimulationStateSave = { actorStates: [actorState()] };

    expect(builder.getSimActions(state)).toEqual([]);
    expect(builder.prevSimState).toEqual(state);
  });

  it('emits nothing when the state is unchanged', () => {
    const builder = makeBuilder();
    builder.prevSimState = { actorStates: [actorState()] };

    expect(builder.getSimActions({ actorStates: [actorState()] })).toEqual([]);
  });

  it('spawns a new actor that nobody picked', () => {
    const spawned = actorState({ guid: 'new' });
    const builder = makeBuilder([{ guid: 'new' }]);
    builder.prevSimState = { actorStates: [] };

    expect(builder.getSimActions({ actorStates: [spawned] })).toEqual([
      { type: ServerAction.SPAWN_ACTOR, payload: spawned },
    ]);
  });

  it('spawns a picked actor bound to the picking client', () => {
    const spawned = actorState({ guid: 'new' });
    const builder = makeBuilder([{ guid: 'new', picked: 'client-9' }]);
    builder.prevSimState = { actorStates: [] };

    expect(builder.getSimActions({ actorStates: [spawned] })).toEqual([
      { type: ServerAction.SPAWN_PICKED_ACTOR, payload: { clientId: 'client-9', state: spawned } },
    ]);
  });

  it('broadcasts actor removal once when an actor leaves the state', () => {
    const builder = makeBuilder();
    builder.prevSimState = { actorStates: [actorState({ guid: 'gone' })] };

    expect(builder.getSimActions({ actorStates: [] })).toEqual([{ type: ServerAction.REMOVE_ACTOR, payload: 'gone' }]);
    expect(builder.getSimActions({ actorStates: [] })).toEqual([]);
  });

  it('emits MOVE_ACTOR and ROTATE_ACTOR for transformation changes', () => {
    const builder = makeBuilder();
    builder.prevSimState = { actorStates: [actorState()] };

    const actions = builder.getSimActions({
      actorStates: [
        actorState({ transformation: { position: [1, 2, 3], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1] } }),
      ],
    });

    expect(actions).toEqual([
      { type: ServerAction.MOVE_ACTOR, payload: { guid: 'actor', position: [1, 2, 3] } },
      { type: ServerAction.ROTATE_ACTOR, payload: { guid: 'actor', position: [0, Math.PI / 2, 0] } },
    ]);
  });

  it('emits RERENDER_DECK when a deck card changes', () => {
    const builder = makeBuilder();
    builder.prevSimState = { actorStates: [deck([card('back1'), card('face1')])] };

    const actions = builder.getSimActions({ actorStates: [deck([card('back1'), card('face2')])] });

    expect(actions).toContainEqual({
      type: ServerAction.RERENDER_DECK,
      payload: {
        guid: 'deck',
        grid: { faceURL: 'face2', backURL: 'back1-back', cols: 1, rows: 1, sequence: 0 },
        size: 2,
        cards: [card('back1'), card('face2')],
      },
    });
  });
});

describe('getActorPositionUpdate / getActorRotationUpdate / getActorScaleUpdate', () => {
  it('returns null for equal transforms, including against the defaults', () => {
    const builder = new ActionBuilder();
    const withTransform = actorState();
    const withoutTransform: ActorState = {
      guid: 'actor',
      name: 'Actor',
      type: ActorType.ACTOR,
      model: { meshURL: '' },
    };

    expect(builder.getActorPositionUpdate(withTransform, withTransform)).toBeNull();
    expect(builder.getActorRotationUpdate(withoutTransform, withoutTransform)).toBeNull();
    expect(builder.getActorScaleUpdate(withoutTransform, withoutTransform)).toBeNull();
  });

  it('returns the changed position, rotation, and scale', () => {
    const builder = new ActionBuilder();
    const prev = actorState();
    const next = actorState({
      transformation: { position: [4, 5, 6], rotation: [0, 1, 0], scale: [2, 2, 2] },
    });

    expect(builder.getActorPositionUpdate(prev, next)).toEqual([4, 5, 6]);
    expect(builder.getActorRotationUpdate(prev, next)).toEqual([0, 1, 0]);
    expect(builder.getActorScaleUpdate(prev, next)).toEqual([2, 2, 2]);
  });
});

describe('sub-threshold drift', () => {
  it('skips unchanged snapshots without forgetting accumulated motion', () => {
    const builder = makeBuilder();
    const stateAt = (x: number, sleeping: boolean): SimulationStateSave => ({
      actorStates: [{ ...actorState({ transformation: { position: [x, 0, 0] } }), sleeping }],
    });
    builder.getSimActions(stateAt(0, false));
    const compare = vi.spyOn(builder, '_getSimActions');

    expect(builder.getSimActions(stateAt(0.0004, true))).toEqual([]);
    expect(compare).toHaveBeenCalledTimes(1);
    expect(builder.getSimActions(stateAt(0.0004, true))).toEqual([]);
    expect(compare).toHaveBeenCalledTimes(1);
    expect(builder.getSimActions(stateAt(0.0008, true))).toEqual([]);
    expect(builder.getSimActions(stateAt(0.0012, false))).toEqual([
      { type: ServerAction.MOVE_ACTOR, payload: { guid: 'actor', position: [0.0012, 0, 0] } },
    ]);
    expect(builder.getSimActions(stateAt(0.0012, false))).toEqual([]);
    expect(compare).toHaveBeenCalledTimes(3);
  });

  const driftingActor = (x: number): UnknownActorState => ({
    type: ActorType.ACTOR,
    guid: 'box',
    name: 'box',
    model: { meshURL: '' },
    transformation: { position: [x, 0.55, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  });

  it.each(['position', 'rotation'] as const)('accumulates %s independently of other transmitted changes', field => {
    const otherField = field === 'position' ? 'rotation' : 'position';
    const state = (value: number, otherValue: number): SimulationStateSave => ({
      actorStates: [actorState({ transformation: { [field]: [value, 0, 0], [otherField]: [otherValue, 0, 0] } })],
    });
    const builder = makeBuilder();
    builder.getSimActions(state(0, 0));
    const actionType = field === 'position' ? ServerAction.MOVE_ACTOR : ServerAction.ROTATE_ACTOR;

    for (const [value, otherValue] of [
      [0.0004, 1],
      [0.0008, 2],
    ]) {
      const actions = builder.getSimActions(state(value, otherValue));
      expect(actions).toHaveLength(1);
      expect(actions[0].type).not.toBe(actionType);
    }
    expect(builder.getSimActions(state(0.0012, 2))).toEqual([
      { type: actionType, payload: { guid: 'actor', position: [0.0012, 0, 0] } },
    ]);
    expect(builder.getSimActions(state(0.0016, 2))).toEqual([]);
    expect(builder.getSimActions(state(0.002, 2))).toEqual([]);
    expect(builder.getSimActions(state(0.0024, 2))).toEqual([
      { type: actionType, payload: { guid: 'actor', position: [0.0024, 0, 0] } },
    ]);
  });

  it('retains a snapshot when the initial input is mutated', () => {
    const builder = makeBuilder();
    const initial = { actorStates: [driftingActor(0)] };
    builder.getSimActions(initial);
    initial.actorStates[0].transformation!.position![0] = 0.0012;

    expect(builder.getSimActions(initial)).toEqual([
      { type: ServerAction.MOVE_ACTOR, payload: { guid: 'box', position: [0.0012, 0.55, 0] } },
    ]);
  });

  it.each<[UnknownActorState, UnknownActorState, ServerAction]>([
    [deck([card('first'), card('second')]), deck([card('second')]), ServerAction.RERENDER_DECK],
    [
      { guid: 'bag', name: 'Bag', type: ActorType.BAG, containedObjects: [actorState()] },
      { guid: 'bag', name: 'Bag', type: ActorType.BAG, containedObjects: [] },
      ServerAction.RERENDER_BAG,
    ],
    [
      { guid: 'stack', name: 'Stack', type: ActorType.TILE_STACK, tileType: 0, faceURL: '', size: 2 },
      { guid: 'stack', name: 'Stack', type: ActorType.TILE_STACK, tileType: 0, faceURL: '', size: 1 },
      ServerAction.RERENDER_TILE_STACK,
    ],
  ])('preserves pending motion through a container rerender %#', (before, after, actionType) => {
    const builder = makeBuilder();
    builder.getSimActions({ actorStates: [before] });
    const stateAt = (value: number): SimulationStateSave => ({
      actorStates: [{ ...after, transformation: { position: [value, 0, 0], rotation: [0, value, 0] } }],
    });

    const actions = builder.getSimActions(stateAt(0.0004));
    expect(actions.map(action => action.type)).toEqual([actionType]);
    expect(builder.getSimActions(stateAt(0.0008))).toEqual([]);
    expect(builder.getSimActions(stateAt(0.0012))).toEqual([
      { type: ServerAction.MOVE_ACTOR, payload: { guid: after.guid, position: [0.0012, 0, 0] } },
      { type: ServerAction.ROTATE_ACTOR, payload: { guid: after.guid, position: [0, 0.0012, 0] } },
    ]);
    expect(builder.getSimActions(stateAt(0.0012))).toEqual([]);
  });

  it('forgets removed actors so the same guid can spawn again', () => {
    const builder = makeBuilder([{ guid: 'box' }]);
    const initial = { actorStates: [driftingActor(0)] };
    builder.getSimActions(initial);
    expect(builder.getSimActions({ actorStates: [] })).toEqual([{ type: ServerAction.REMOVE_ACTOR, payload: 'box' }]);
    expect(builder.getSimActions({ actorStates: [] })).toEqual([]);
    expect(builder.getSimActions(initial)).toEqual([
      { type: ServerAction.SPAWN_ACTOR, payload: initial.actorStates[0] },
    ]);
    expect(builder.getSimActions(initial)).toEqual([]);
  });

  it('broadcasts accumulated sub-threshold motion instead of swallowing it', () => {
    const builder = new ActionBuilder();
    builder.sim = { actors: [] } as unknown as typeof builder.sim;
    builder.prevSimState = { actorStates: [driftingActor(0)] };

    expect(builder.getSimActions({ actorStates: [driftingActor(0.0004)] })).toEqual([]);
    expect(builder.getSimActions({ actorStates: [driftingActor(0.0008)] })).toEqual([]);
    expect(builder.getSimActions({ actorStates: [driftingActor(0.0012)] })).toContainEqual({
      type: ServerAction.MOVE_ACTOR,
      payload: { guid: 'box', position: [0.0012, 0.55, 0] },
    });
    expect(builder.getSimActions({ actorStates: [driftingActor(0.0012)] })).toEqual([]);
  });

  it('does not repeat a deck rerender once delivered', () => {
    const deck = (cards: string[]): DeckState => ({
      type: ActorType.DECK,
      guid: 'deck',
      name: 'Deck',
      cards: cards.map(guid => ({
        type: ActorType.CARD,
        guid,
        name: guid,
        faceURL: `${guid}.png`,
        backURL: `${guid}.png`,
        cols: 1,
        rows: 1,
        sequence: 0,
      })),
    });
    const builder = new ActionBuilder();
    builder.sim = { actors: [] } as unknown as typeof builder.sim;
    builder.prevSimState = { actorStates: [deck(['first', 'second'])] };

    const actions = builder.getSimActions({ actorStates: [deck(['second', 'first'])] });
    expect(actions.filter(action => action.type === ServerAction.RERENDER_DECK)).toHaveLength(1);
    expect(builder.getSimActions({ actorStates: [deck(['second', 'first'])] })).toEqual([]);
  });

  it('does not repeat a bag rerender once delivered', () => {
    const item = (guid: string): UnknownActorState => ({
      type: ActorType.ACTOR,
      guid,
      name: guid,
      model: { meshURL: `${guid}.obj` },
    });
    const bag = (items: UnknownActorState[]): BagState => ({
      type: ActorType.BAG,
      guid: 'bag',
      name: 'Bag',
      containedObjects: items,
    });
    const builder = new ActionBuilder();
    builder.sim = { actors: [] } as unknown as typeof builder.sim;
    builder.prevSimState = { actorStates: [bag([item('first'), item('second')])] };

    expect(builder.getSimActions({ actorStates: [bag([item('first')])] }).map(a => a.type)).toContain(
      ServerAction.RERENDER_BAG,
    );
    expect(builder.getSimActions({ actorStates: [bag([item('first')])] })).toEqual([]);
  });

  it('does not respawn an actor once delivered', () => {
    const builder = new ActionBuilder();
    builder.sim = { actors: [{ guid: 'box', picked: null }] } as unknown as typeof builder.sim;
    builder.prevSimState = { actorStates: [] };

    expect(builder.getSimActions({ actorStates: [driftingActor(0)] }).map(a => a.type)).toContain(
      ServerAction.SPAWN_ACTOR,
    );
    expect(builder.getSimActions({ actorStates: [driftingActor(0)] })).toEqual([]);
  });
});

describe('bag rerender', () => {
  const bagItem = (guid: string): UnknownActorState => ({
    type: ActorType.ACTOR,
    guid,
    name: guid,
    model: { meshURL: `${guid}.obj` },
  });
  const bag = (items: UnknownActorState[]): BagState => ({
    guid: 'bag',
    name: 'Bag',
    type: ActorType.BAG,
    containedObjects: items,
  });

  it('delivers the remaining contents when an item is extracted', () => {
    const remaining = [bagItem('first')];
    const builder = new ActionBuilder();

    expect(builder.getBagRerender(bag([...remaining, bagItem('drawn')]), bag(remaining))).toEqual({
      guid: 'bag',
      containedObjects: remaining,
    });
  });

  it.each([
    ['shuffle', [bagItem('second'), bagItem('first')]],
    ['final extraction', []],
  ])('broadcasts %s and suppresses the next unchanged tick', (_, remaining) => {
    const builder = makeBuilder();
    builder.prevSimState = { actorStates: [bag([bagItem('first'), bagItem('second')])] };
    const state = { actorStates: [bag(remaining)] };

    const actions = builder.getSimActions(state);

    expect(actions).toEqual([
      { type: ServerAction.RERENDER_BAG, payload: { guid: 'bag', containedObjects: remaining } },
    ]);
    expect(builder.getSimActions(state)).toEqual([]);
  });

  it('does not rerender an unchanged bag', () => {
    expect(new ActionBuilder().getBagRerender(bag([bagItem('first')]), bag([bagItem('first')]))).toBeNull();
  });
});
