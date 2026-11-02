import type { UnknownActorState } from '@tt/states';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureRoom, type Room, type RoomSnapshot } from './api';
import { waitForActorStable, waitForRoomStable } from './physics';
import { compareSnapshots } from '../assertions/snapshots';

vi.mock('./api', () => ({ captureRoom: vi.fn() }));

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe('physics stability', () => {
  it.each(['actor', 'server'] as const)('%s waits for five samples relative to a fixed anchor', async target => {
    vi.useFakeTimers();
    const room = {} as Room;
    const before = { guid: 'actor', transformation: { position: [0, 0, 0] } } as UnknownActorState;
    const capture = (x: number): RoomSnapshot =>
      ({ state: { actorStates: [{ ...before, transformation: { position: [x, 0, 0] } }] } }) as RoomSnapshot;
    const settled = capture(0.008);
    vi.mocked(captureRoom)
      .mockResolvedValueOnce(capture(0))
      .mockResolvedValueOnce(capture(0.004))
      .mockResolvedValue(settled);

    const waiting =
      target === 'server' ? waitForRoomStable(room) : waitForActorStable(room, 'actor', () => true, before);
    const completed = vi.fn();
    void waiting.then(completed);
    await vi.advanceTimersByTimeAsync(900);
    expect(completed).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(150);
    expect(await waiting).toBe(settled);
  });

  it('starts counting actor stability only after the expected outcome', async () => {
    const before = { guid: 'actor', name: 'before' } as UnknownActorState;
    vi.mocked(captureRoom).mockResolvedValue({ state: { actorStates: [before] } } as RoomSnapshot);
    const waiting = waitForActorStable({} as Room, 'actor', (_, actor) => actor.name === 'after', before, 300);
    await expect(waiting).rejects.toThrow('outcomeObserved');
  });

  it('accepts a real action that settles back to its starting pose', async () => {
    vi.useFakeTimers();
    const before = { guid: 'actor', transformation: { rotation: [0, 0, 0] } } as UnknownActorState;
    const settled = { state: { actorStates: [before] } } as RoomSnapshot;
    const moving = { ...before, transformation: { rotation: [0, 0.5, 0] } } as UnknownActorState;
    vi.mocked(captureRoom)
      .mockResolvedValueOnce(settled)
      .mockResolvedValueOnce({ state: { actorStates: [moving] } } as RoomSnapshot)
      .mockResolvedValue(settled);
    const waiting = waitForActorStable(
      {} as Room,
      'actor',
      (_, actor) => actor.transformation!.rotation![1] > 0.1,
      before,
    );
    await vi.advanceTimersByTimeAsync(1_200);
    expect(await waiting).toBe(settled);
    expect(captureRoom).toHaveBeenCalledTimes(8);
  });

  it.each(['actor', 'room'] as const)('%s polling propagates API errors without retrying them', async target => {
    const error = new Error('API returned 500: unrelated outage');
    vi.mocked(captureRoom).mockRejectedValue(error);
    const room = {} as Room;
    const before = { guid: 'actor' } as UnknownActorState;
    const waiting = target === 'room' ? waitForRoomStable(room) : waitForActorStable(room, 'actor', () => true, before);
    await expect(waiting).rejects.toBe(error);
    expect(captureRoom).toHaveBeenCalledOnce();
  });
});

describe('persistence transform comparison limits', () => {
  const state = (x: number, rotation = 0, scale = 1, name = 'saved') => ({
    actorStates: [
      {
        guid: 'actor',
        name,
        transformation: {
          position: [x, 0, 0],
          rotation: [0, rotation, 0],
          scale: [scale, 1, 1],
        },
      },
    ],
  });

  it('allows bounded settling while rejecting changed saved state', () => {
    const options = { position: 0.02, rotation: 0.01 };
    expect(compareSnapshots(state(0), state(0.02, 0.009), options)).toEqual([]);
    for (const changed of [state(0.021), state(0, 0.011), state(0, 0, 1.002), state(0, 0, 1, 'lost')]) {
      expect(compareSnapshots(state(0), changed, options).length).toBeGreaterThan(0);
    }
  });
});
