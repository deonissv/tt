import { ClientAction } from '@tt/actions';
import { expect, it, vi } from 'vitest';
import type { RoomConnection } from '../support/room-connection';
import { clientActionMatches, expectClientAction } from './protocol';

const abortError = (signal: AbortSignal): Error => {
  const reason: unknown = signal.reason;
  return reason instanceof Error ? reason : new Error('Action observation aborted');
};

it('recognizes a requested actor in a batch of public input messages', () => {
  const payload = JSON.stringify([
    { type: ClientAction.CURSOR, payload: [0, 0] },
    { type: ClientAction.PICK_ACTOR, payload: 'actor' },
  ]);
  expect(clientActionMatches(payload, ClientAction.PICK_ACTOR, 'actor')).toBe(true);
  expect(clientActionMatches(payload, ClientAction.PICK_ACTOR, 'other')).toBe(false);
  expect(clientActionMatches(payload, ClientAction.RELEASE_ACTOR, 'actor')).toBe(false);
});

it('supports structured movement payloads and observations without an identity', () => {
  const payload = JSON.stringify([{ type: ClientAction.MOVE_ACTOR, payload: { guid: 'actor', position: [0, 1, 0] } }]);
  expect(clientActionMatches(payload, ClientAction.MOVE_ACTOR, 'actor')).toBe(true);
  expect(clientActionMatches(payload, ClientAction.MOVE_ACTOR)).toBe(true);
  expect(clientActionMatches(payload, ClientAction.MOVE_ACTOR, 'other')).toBe(false);
});

it('ignores binary frames and non-message JSON without accepting an action', () => {
  expect(clientActionMatches(Buffer.from('binary'), ClientAction.PICK_ACTOR)).toBe(false);
  expect(clientActionMatches('{}', ClientAction.PICK_ACTOR)).toBe(false);
  expect(clientActionMatches('[]', ClientAction.PICK_ACTOR)).toBe(false);
});

it('propagates malformed protocol messages', () => {
  expect(() => clientActionMatches('not JSON', ClientAction.PICK_ACTOR)).toThrow();
});

it('allows native input to finish before timing out its resulting action', async () => {
  vi.useFakeTimers();
  try {
    const connection = {
      socket: {
        waitForEvent: vi.fn(
          (_: string, { timeout, signal }: { timeout: number; signal: AbortSignal }) =>
            new Promise<void>((resolve, reject) => {
              if (timeout) setTimeout(() => reject(new Error('observation timed out')), timeout);
              signal.addEventListener('abort', () => reject(abortError(signal)), { once: true });
              setTimeout(resolve, 55);
            }),
        ),
      },
    } as unknown as RoomConnection;
    const result = expectClientAction(
      connection,
      ClientAction.MOVE_ACTOR,
      () => new Promise(resolve => setTimeout(resolve, 50)),
      'actor',
      10,
    ).then(
      () => 'observed',
      () => 'timed out',
    );
    await vi.advanceTimersByTimeAsync(60);
    expect(await result).toBe('observed');
  } finally {
    vi.useRealTimers();
  }
});

it('still times out when completed input produces no matching action', async () => {
  vi.useFakeTimers();
  try {
    const connection = {
      socket: {
        waitForEvent: vi.fn(
          (_: string, { signal }: { signal: AbortSignal }) =>
            new Promise<void>((_, reject) => {
              signal.addEventListener('abort', () => reject(abortError(signal)), { once: true });
            }),
        ),
      },
    } as unknown as RoomConnection;
    const result = expectClientAction(connection, ClientAction.MOVE_ACTOR, () => Promise.resolve(), 'actor', 10).catch(
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(11);
    expect(await result).toEqual(new Error(`Timed out waiting for client action ${ClientAction.MOVE_ACTOR}`));
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

it('settles in-flight native input before a socket failure can trigger a retry', async () => {
  vi.useFakeTimers();
  try {
    const connection = {
      socket: {
        waitForEvent: vi.fn(() => Promise.reject(new Error('socket closed'))),
      },
    } as unknown as RoomConnection;
    let settled = false;
    const result = expectClientAction(
      connection,
      ClientAction.MOVE_ACTOR,
      () => new Promise(resolve => setTimeout(resolve, 50)),
      'actor',
      10,
    ).catch((error: unknown) => {
      settled = true;
      return error;
    });
    await vi.advanceTimersByTimeAsync(10);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(50);
    expect(await result).toEqual(new Error('socket closed'));
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
