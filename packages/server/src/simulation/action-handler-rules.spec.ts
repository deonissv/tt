import { ActorType, type ActorState, type BagState, type UnknownActorState } from '@tt/states';
import type { Client } from '../rooms/client';
import { ActionHandler } from './action-handler';
import type { ServerBase } from './actors';
import { move, pick, pickItem, release, shuffle } from './behaviors';

vi.mock('./behaviors', () => ({
  flip: vi.fn(),
  move: vi.fn(),
  pick: vi.fn(),
  pickItem: vi.fn(),
  release: vi.fn(),
  roll: vi.fn(),
  rotate: vi.fn(),
  shuffle: vi.fn(),
}));

const player = {
  code: 'player',
  pickHeight: 2,
  rotationStep: Math.PI / 2,
} as Client;

const actorState = (locked = false): ActorState => ({
  type: ActorType.ACTOR,
  guid: 'actor',
  name: 'actor',
  model: { meshURL: 'actor.obj' },
  locked,
});

const bagState = (size: number): BagState => ({
  type: ActorType.BAG,
  guid: 'bag',
  name: 'bag',
  containedObjects: Array.from({ length: size }, (_, index) => ({
    ...actorState(),
    guid: `item-${index}`,
  })),
});

const runtimeActor = (state: UnknownActorState): ServerBase =>
  ({
    guid: state.guid,
    toState: () => structuredClone(state),
  }) as unknown as ServerBase;

describe('ActionHandler portable rules', () => {
  let handler: ActionHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new ActionHandler();
    handler.client = player;
  });

  it('rejects picking a locked actor before invoking runtime behavior', () => {
    handler.actors = [runtimeActor(actorState(true))];

    handler.handlePickActor('actor');

    expect(pick).not.toHaveBeenCalled();
  });

  it('rejects extraction from an empty container before invoking runtime behavior', () => {
    handler.actors = [runtimeActor(bagState(0))];

    handler.handlePickItem('bag');

    expect(pickItem).not.toHaveBeenCalled();
  });

  it('allows extraction when portable container rules pass', () => {
    const actor = runtimeActor(bagState(1));
    handler.actors = [actor];

    handler.handlePickItem('bag');

    expect(pickItem).toHaveBeenCalledWith(actor, player.code, player.pickHeight);
  });

  it('allows extraction from a locked container like Tabletop Simulator does', () => {
    const lockedBag = { ...bagState(1), locked: true };
    const actor = runtimeActor(lockedBag);
    handler.actors = [actor];

    handler.handlePickItem('bag');

    expect(pickItem).toHaveBeenCalledWith(actor, player.code, player.pickHeight);
  });

  it('rejects grabbing a locked container before invoking runtime behavior', () => {
    handler.actors = [runtimeActor({ ...bagState(1), locked: true })];

    handler.handlePickActor('bag');

    expect(pick).not.toHaveBeenCalled();
  });

  it('requires at least two items before invoking shuffle behavior', () => {
    handler.actors = [runtimeActor(bagState(1))];

    handler.handleShuffle('bag');

    expect(shuffle).not.toHaveBeenCalled();
  });

  it('allows shuffle when portable container rules pass', () => {
    const actor = runtimeActor(bagState(2));
    handler.actors = [actor];

    handler.handleShuffle('bag');

    expect(shuffle).toHaveBeenCalledWith(actor);
  });

  it.each([null, 'another-player'])('rejects moving and releasing a pawn held by %s', holder => {
    const actor = runtimeActor(actorState());
    actor.picked = holder;
    handler.actors = [actor];

    handler.handleMoveActor('actor', [1, 2]);
    handler.handleReleaseActor('actor');

    expect(move).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
  });

  it('allows the holding player to move and release the actor', () => {
    const actor = runtimeActor(actorState());
    actor.picked = player.code;
    handler.actors = [actor];

    handler.handleMoveActor('actor', [1, 2]);
    handler.handleReleaseActor('actor');

    expect(move).toHaveBeenCalledWith(actor, 1, 2);
    expect(release).toHaveBeenCalledWith(actor);
  });
});
