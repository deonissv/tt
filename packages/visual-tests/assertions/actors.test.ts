import { ActorType, type ActorState, type BagState, type SimulationStateSave } from '@tt/states';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureRoom, type Room, type RoomSnapshot } from '../support/api';
import { expectActorUnchanged, expectRoomUnchanged, expectSpawnedActor } from './actors';

const room: Room = { origin: 'http://localhost', roomCode: 'room', authorToken: 'author', observerToken: 'observer' };
const child = (sleeping = false): ActorState => ({
  type: ActorType.ACTOR,
  guid: 'child',
  name: 'Child',
  model: { meshURL: 'box.obj' },
  sleeping,
});
const roomSnapshot = (state: SimulationStateSave): RoomSnapshot => ({
  state,
  downloadProgress: { loaded: 0, total: 0, succeeded: 0, failed: 0 },
});
const simpleActor = (guid: string): ActorState => ({
  type: ActorType.ACTOR,
  guid,
  name: guid,
  model: { meshURL: 'box.obj' },
});

vi.mock('../support/api', () => ({ captureRoom: vi.fn() }));

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe('unchanged actor observation', () => {
  const before: BagState = { type: ActorType.BAG, guid: 'actor', name: 'before', containedObjects: [] };

  it('observes unchanged state for the whole window', async () => {
    vi.useFakeTimers();
    vi.mocked(captureRoom).mockResolvedValue(roomSnapshot({ actorStates: [before] }));
    const waiting = expectActorUnchanged(room, before, 450);
    const completed = vi.fn();
    void waiting.then(completed);
    await vi.advanceTimersByTimeAsync(300);
    expect(completed).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(150);
    await waiting;
    expect(captureRoom).toHaveBeenCalledTimes(3);
  });

  it.each([
    [false, true],
    [true, false],
    [undefined, true],
    [false, undefined],
  ])('allows physics sleeping to change from %s to %s', async (initial, sleeping) => {
    vi.useFakeTimers();
    const actor = { ...before, ...(initial === undefined ? {} : { sleeping: initial }) };
    const current = { ...before, ...(sleeping === undefined ? {} : { sleeping }) };
    vi.mocked(captureRoom)
      .mockResolvedValueOnce(roomSnapshot({ actorStates: [actor] }))
      .mockResolvedValue(roomSnapshot({ actorStates: [current] }));
    const waiting = expectActorUnchanged(room, actor, 450);
    const result = waiting.then(
      () => undefined,
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(450);
    expect(await result).toBeUndefined();
    expect(captureRoom).toHaveBeenCalledTimes(3);
    expect(actor.sleeping).toBe(initial);
  });

  it.each<{ field: string; change: Partial<BagState> }>([
    { field: 'position', change: { transformation: { position: [1, 0, 0] } } },
    { field: 'rotation', change: { transformation: { rotation: [0, 1, 0] } } },
    { field: 'scale', change: { transformation: { scale: [2, 1, 1] } } },
    { field: 'locked', change: { locked: true } },
    { field: 'nested sleeping', change: { containedObjects: [child(true)] } },
  ])('rejects changed $field even when physics sleeping changes', async ({ change }) => {
    const actor: BagState = {
      ...before,
      sleeping: false,
      locked: false,
      transformation: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      containedObjects: [child(false)],
    };
    vi.mocked(captureRoom).mockResolvedValue(roomSnapshot({ actorStates: [{ ...actor, sleeping: true, ...change }] }));
    await expect(expectActorUnchanged(room, actor)).rejects.toThrow('changed during observation');
  });

  it('propagates unrelated API errors without rewriting their signature', async () => {
    const error = new Error('API returned 500: unrelated outage');
    vi.mocked(captureRoom).mockRejectedValue(error);
    await expect(expectActorUnchanged(room, before)).rejects.toBe(error);
  });

  it('rejects a missing actor', async () => {
    vi.mocked(captureRoom).mockResolvedValue(roomSnapshot({ actorStates: [] }));
    await expect(expectActorUnchanged(room, before)).rejects.toThrow('not found');
  });

  it('rejects an observed change instead of classifying it as unchanged', async () => {
    vi.mocked(captureRoom).mockResolvedValue(roomSnapshot({ actorStates: [{ ...before, name: 'after' }] }));
    await expect(expectActorUnchanged(room, before)).rejects.toThrow('changed during observation');
  });
});

describe('new actor observation', () => {
  const before: SimulationStateSave = { actorStates: [simpleActor('container')] };

  it('returns the one new identity after its state settles', async () => {
    vi.useFakeTimers();
    const actor: ActorState = { ...simpleActor('extracted'), transformation: { position: [1, 2, 3] } };
    vi.mocked(captureRoom).mockResolvedValue(roomSnapshot({ actorStates: [...before.actorStates!, actor] }));
    const waiting = expectSpawnedActor(room, before);
    await vi.advanceTimersByTimeAsync(900);
    expect(await waiting).toEqual(actor);
  });

  it('rejects multiple new identities even when the total count increased by one', async () => {
    vi.mocked(captureRoom).mockResolvedValue(roomSnapshot({ actorStates: [simpleActor('one'), simpleActor('two')] }));
    await expect(expectSpawnedActor(room, before)).rejects.toThrow('exactly one new identity');
  });

  it('propagates unrelated API errors', async () => {
    const error = new Error('API returned 500');
    vi.mocked(captureRoom).mockRejectedValue(error);
    await expect(expectSpawnedActor(room, before)).rejects.toBe(error);
  });
});

describe('unchanged room observation', () => {
  const actor: BagState = {
    type: ActorType.BAG,
    name: 'Bag',
    guid: 'actor',
    locked: false,
    sleeping: false,
    containedObjects: [child(false)],
  };
  const before: SimulationStateSave = { actorStates: [actor], table: { type: 'Circle' } };

  it('allows only top-level physics sleep transitions across all observation samples', async () => {
    vi.useFakeTimers();
    vi.mocked(captureRoom).mockResolvedValue(roomSnapshot({ ...before, actorStates: [{ ...actor, sleeping: true }] }));
    const waiting = expectRoomUnchanged(room, before, 450);
    await vi.advanceTimersByTimeAsync(450);
    await waiting;
    expect(captureRoom).toHaveBeenCalledTimes(3);
    expect(actor.sleeping).toBe(false);
  });

  it.each<{ field: string; change: Partial<SimulationStateSave> }>([
    { field: 'removed actor', change: { actorStates: [] } },
    { field: 'added actor', change: { actorStates: [actor, { ...actor, guid: 'extra' }] } },
    { field: 'locked', change: { actorStates: [{ ...actor, locked: true }] } },
    { field: 'table', change: { table: { type: 'Rectangle' } } },
    {
      field: 'contained sleep state',
      change: { actorStates: [{ ...actor, containedObjects: [child(true)] }] },
    },
  ])('rejects changed $field', async ({ change }) => {
    vi.mocked(captureRoom).mockResolvedValue(roomSnapshot({ ...before, ...change }));
    await expect(expectRoomUnchanged(room, before)).rejects.toThrow('Room changed during observation');
  });

  it('detects a change after an initially unchanged sample', async () => {
    vi.useFakeTimers();
    vi.mocked(captureRoom)
      .mockResolvedValueOnce(roomSnapshot(before))
      .mockResolvedValue(roomSnapshot({ ...before, actorStates: [] }));
    const result = expect(expectRoomUnchanged(room, before, 450)).rejects.toThrow('Room changed during observation');
    await vi.advanceTimersByTimeAsync(150);
    await result;
  });
});
