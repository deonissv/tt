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
