import { ActorType, type ActorState, type BagState, type UnknownActorState } from '@tt/states';
import type { Client } from '../rooms/client';
import { ActionHandler } from './action-handler';
import { ServerBase } from './actors';
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

type ActorSpies = Record<'pick' | 'pickItem' | 'shuffle' | 'move' | 'release', ReturnType<typeof vi.fn>>;
type MockActor = ServerBase & { spies: ActorSpies };

const runtimeActor = (state: UnknownActorState): MockActor => {
  const spies = {
    pick: vi.fn(),
    pickItem: vi.fn().mockResolvedValue(null),
    shuffle: vi.fn(),
    move: vi.fn(),
    release: vi.fn(),
  };
  const actor = {
    guid: state.guid,
    ...spies,
    spies,
    toState: () => structuredClone(state),
  } as unknown as MockActor;
  Object.setPrototypeOf(actor, ServerBase.prototype);
  return actor;
};

describe('ActionHandler portable rules', () => {
  let handler: ActionHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new ActionHandler();
    handler.client = player;
  });

  it('rejects picking a locked actor before invoking runtime behavior', () => {
    const actor = runtimeActor(actorState(true));
    handler.actors = [actor];

    handler.handlePickActor('actor');

    expect(actor.spies.pick).not.toHaveBeenCalled();
  });

  it('rejects extraction from an empty container before invoking runtime behavior', () => {
    const actor = runtimeActor(bagState(0));
    handler.actors = [actor];

    handler.handlePickItem('bag');

    expect(actor.spies.pickItem).not.toHaveBeenCalled();
  });

  it('allows extraction when portable container rules pass', () => {
    const actor = runtimeActor(bagState(1));
    handler.actors = [actor];

    handler.handlePickItem('bag');

    expect(actor.spies.pickItem).toHaveBeenCalledWith(player.code, player.pickHeight);
  });

  it('allows extraction from a locked container like Tabletop Simulator does', () => {
    const lockedBag = { ...bagState(1), locked: true };
    const actor = runtimeActor(lockedBag);
    handler.actors = [actor];

    handler.handlePickItem('bag');

    expect(actor.spies.pickItem).toHaveBeenCalledWith(player.code, player.pickHeight);
  });

  it('rejects grabbing a locked container before invoking runtime behavior', () => {
    const actor = runtimeActor({ ...bagState(1), locked: true });
    handler.actors = [actor];

    handler.handlePickActor('bag');

    expect(actor.spies.pick).not.toHaveBeenCalled();
  });

  it('requires at least two items before invoking shuffle behavior', () => {
    const actor = runtimeActor(bagState(1));
    handler.actors = [actor];

    handler.handleShuffle('bag');

    expect(actor.spies.shuffle).not.toHaveBeenCalled();
  });

  it('allows shuffle when portable container rules pass', () => {
    const actor = runtimeActor(bagState(2));
    handler.actors = [actor];

    handler.handleShuffle('bag');

    expect(actor.spies.shuffle).toHaveBeenCalledWith();
  });

  it('rejects container actions on an ordinary actor before calling unsupported methods', () => {
    const actor = runtimeActor(actorState());
    handler.actors = [actor];

    handler.handlePickItem('actor');
    handler.handleShuffle('actor');

    expect(actor.spies.pickItem).not.toHaveBeenCalled();
    expect(actor.spies.shuffle).not.toHaveBeenCalled();
  });

  it('does not add unsupported operations to the base actor', () => {
    expect(ServerBase.prototype).not.toHaveProperty('pickItem');
    expect(ServerBase.prototype).not.toHaveProperty('shuffle');
    expect(ServerBase.prototype).not.toHaveProperty('roll');
  });

  it.each([null, 'another-player'])('rejects moving and releasing a pawn held by %s', holder => {
    const actor = runtimeActor(actorState());
    actor.picked = holder;
    handler.actors = [actor];

    handler.handleMoveActor('actor', [1, 2]);
    handler.handleReleaseActor('actor');

    expect(actor.spies.move).not.toHaveBeenCalled();
    expect(actor.spies.release).not.toHaveBeenCalled();
  });

  it('allows the holding player to move and release the actor', () => {
    const actor = runtimeActor(actorState());
    actor.picked = player.code;
    handler.actors = [actor];

    handler.handleMoveActor('actor', [1, 2]);
    handler.handleReleaseActor('actor');

    expect(actor.spies.move).toHaveBeenCalledWith(1, 2);
    expect(actor.spies.release).toHaveBeenCalledWith();
  });
});
