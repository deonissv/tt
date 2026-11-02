import type { ClientAction, ClientActionMsg } from '@tt/actions';
import type { RoomConnection } from '../support/room-connection';

export function clientActionMatches(payload: string | Buffer, type: ClientAction, guid?: string): boolean {
  if (typeof payload !== 'string') return false;
  const messages = JSON.parse(payload) as ClientActionMsg[];
  return (
    Array.isArray(messages) &&
    messages.some(message => {
      const target = message.payload;
      const targetGuid = typeof target === 'object' && target !== null && 'guid' in target ? target.guid : target;
      return message.type === type && (guid === undefined || targetGuid === guid);
    })
  );
}

// Register the protocol listener before invoking the caller's native input.
export async function expectClientAction(
  connection: RoomConnection,
  type: ClientAction,
  input: () => Promise<unknown>,
  guid?: string,
  timeout = 30_000,
): Promise<void> {
  const abort = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const action = connection.socket.waitForEvent('framesent', {
    timeout: 0,
    signal: abort.signal,
    predicate: ({ payload }) => clientActionMatches(payload, type, guid),
  });
  const nativeInput = Promise.resolve().then(input);
  try {
    await Promise.all([
      action,
      nativeInput.then(() => {
        // Slow browser input must finish before its resulting action can time
        // out. Keep the listener active throughout input so early frames count.
        if (timeout > 0 && !abort.signal.aborted)
          timer = setTimeout(() => abort.abort(new Error(`Timed out waiting for client action ${type}`)), timeout);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    abort.abort();
    // A retry must not overlap mouse commands from the preceding attempt.
    await Promise.allSettled([action, nativeInput]);
  }
}
