import type { UnknownActorState } from '@tt/states';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureRoom, type Room, type RoomSnapshot } from '../support/api';
import { expectActorUnchanged, expectSpawnedActor } from './actors';

vi.mock('../support/api', () => ({ captureRoom: vi.fn() }));

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe('unchanged actor observation', () => {
  const before = { guid: 'actor', name: 'before' } as UnknownActorState;
  const room = {} as Room;

  it('observes unchanged state for the whole window', async () => {
    vi.useFakeTimers();
    vi.mocked(captureRoom).mockResolvedValue({ state: { actorStates: [before] } } as RoomSnapshot);
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
      .mockResolvedValueOnce({ state: { actorStates: [actor] } } as RoomSnapshot)
      .mockResolvedValue({ state: { actorStates: [current] } } as RoomSnapshot);
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

  it.each([
    { field: 'position', change: { transformation: { position: [1, 0, 0] } } },
    { field: 'rotation', change: { transformation: { rotation: [0, 1, 0] } } },
    { field: 'scale', change: { transformation: { scale: [2, 1, 1] } } },
    { field: 'locked', change: { locked: true } },
    { field: 'nested sleeping', change: { containedObjects: [{ guid: 'child', sleeping: true }] } },
  ])('rejects changed $field even when physics sleeping changes', async ({ change }) => {
    const actor = {
      ...before,
      sleeping: false,
      locked: false,
      transformation: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      containedObjects: [{ guid: 'child', sleeping: false }],
    } as UnknownActorState;
    vi.mocked(captureRoom).mockResolvedValue({
      state: { actorStates: [{ ...actor, sleeping: true, ...change }] },
    } as RoomSnapshot);
    await expect(expectActorUnchanged(room, actor)).rejects.toThrow('changed during observation');
  });

  it('propagates unrelated API errors without rewriting their signature', async () => {
    const error = new Error('API returned 500: unrelated outage');
    vi.mocked(captureRoom).mockRejectedValue(error);
    await expect(expectActorUnchanged(room, before)).rejects.toBe(error);
  });

  it('rejects a missing actor', async () => {
    vi.mocked(captureRoom).mockResolvedValue({ state: { actorStates: [] } } as unknown as RoomSnapshot);
    await expect(expectActorUnchanged(room, before)).rejects.toThrow('not found');
  });

  it('rejects an observed change instead of classifying it as unchanged', async () => {
    vi.mocked(captureRoom).mockResolvedValue({
      state: { actorStates: [{ ...before, name: 'after' }] },
    } as RoomSnapshot);
    await expect(expectActorUnchanged(room, before)).rejects.toThrow('changed during observation');
  });
});

describe('new actor observation', () => {
  const room = {} as Room;
  const before = { actorStates: [{ guid: 'container' }] } as RoomSnapshot['state'];

  it('returns the one new identity after its state settles', async () => {
    vi.useFakeTimers();
    const actor = { guid: 'extracted', transformation: { position: [1, 2, 3] } } as UnknownActorState;
    vi.mocked(captureRoom).mockResolvedValue({
      state: { actorStates: [...before.actorStates!, actor] },
    } as RoomSnapshot);
    const waiting = expectSpawnedActor(room, before);
    await vi.advanceTimersByTimeAsync(900);
    expect(await waiting).toEqual(actor);
  });

  it('rejects multiple new identities even when the total count increased by one', async () => {
    vi.mocked(captureRoom).mockResolvedValue({
      state: { actorStates: [{ guid: 'one' }, { guid: 'two' }] },
    } as RoomSnapshot);
    await expect(expectSpawnedActor(room, before)).rejects.toThrow('exactly one new identity');
  });

  it('propagates unrelated API errors', async () => {
    const error = new Error('API returned 500');
    vi.mocked(captureRoom).mockRejectedValue(error);
    await expect(expectSpawnedActor(room, before)).rejects.toBe(error);
  });
});
