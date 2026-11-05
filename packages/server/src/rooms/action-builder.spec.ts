import type { CursorsPld } from '@tt/actions';
import { ServerAction } from '@tt/actions';
import { ActorType, type ActorState, type DeckState, type SimulationStateSave, type TileStackState } from '@tt/states';
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
    });
  });

  it('does not rerender an unchanged empty deck', () => {
    const empty = { ...before, cards: [] };
    expect(new ActionBuilder().getDeckRerender(empty, empty)).toBeNull();
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

  it('emits nothing when an actor is removed (no REMOVE_ACTOR broadcast yet)', () => {
    const builder = makeBuilder();
    builder.prevSimState = { actorStates: [actorState({ guid: 'gone' })] };

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
