import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { ServerAction, ClientAction, type ClientActionMsg } from '@tt/actions';
import { WebSocketServer } from 'ws';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { captureRoom, closeRoom, roomIsRunning, type Room } from './api';

let room: Room;
let shutdown: () => Promise<void>;
let deny: { status: number; body: string } | undefined;
let invalid = false;
let running = true;
let connections: string[];
let actions: unknown[];

const token = (code: string) =>
  `header.${Buffer.from(JSON.stringify({ code, sub: 1 })).toString('base64url')}.signature`;

beforeEach(async () => {
  deny = undefined;
  invalid = false;
  running = true;
  connections = [];
  actions = [];
  const server = createServer((_req, res) => {
    res.writeHead(404);
    res.end();
  });
  const sockets = new WebSocketServer({ noServer: true });
  server.on('upgrade', (req, socket, head) => {
    const failure = deny ?? (!running ? { status: 400, body: 'No room found' } : undefined);
    if (failure) {
      socket.end(
        `HTTP/1.1 ${failure.status} Rejected\r\nConnection: close\r\nContent-Length: ${failure.body.length}\r\n\r\n${failure.body}`,
      );
      return;
    }
    sockets.handleUpgrade(req, socket, head, ws => {
      connections.push(ws.protocol);
      ws.send(
        invalid
          ? 'not JSON'
          : JSON.stringify([
              {
                type: ServerAction.STATE,
                payload: { actorStates: [{ guid: 'actor' }], downloadProgress: { total: 1, failed: 0 } },
              },
            ]),
      );
      ws.on('message', data => {
        if (!Buffer.isBuffer(data)) throw new Error('Expected a text frame buffer');
        const messages = JSON.parse(data.toString('utf8')) as ClientActionMsg[];
        actions.push(...messages);
        if (messages.some(message => message.type === ClientAction.CLOSE)) {
          running = false;
          ws.send(JSON.stringify([{ type: ServerAction.CLOSED, payload: null }]));
        }
      });
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  room = {
    origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    roomCode: 'room',
    authorToken: token('author'),
    observerToken: token('observer'),
  };
  shutdown = async () => {
    for (const socket of sockets.clients) socket.terminate();
    await new Promise<void>(resolve => sockets.close(() => resolve()));
    await new Promise<void>(resolve => server.close(() => resolve()));
  };
});

afterEach(async () => {
  await shutdown();
});

it('reads ordinary STATE snapshots with an independent authenticated observer', async () => {
  expect((await captureRoom(room)).state.actorStates).toEqual([{ guid: 'actor' }]);
  await captureRoom(room);
  expect(connections).toEqual([`Bearer.${token('observer')}`, `Bearer.${token('observer')}`]);
  expect(actions).toEqual([]);
});

it('keeps credentials separate when rooms are observed concurrently', async () => {
  const otherRoom: Room = {
    origin: room.origin,
    roomCode: 'another-room',
    authorToken: token('another-author'),
    observerToken: token('another-observer'),
  };
  await Promise.all([captureRoom(room), captureRoom(otherRoom)]);
  expect(connections.sort()).toEqual([`Bearer.${token('observer')}`, `Bearer.${token('another-observer')}`].sort());
});

it('closes through the author protocol and treats a stopped room as idempotent cleanup', async () => {
  await closeRoom(room);
  expect(connections).toEqual([`Bearer.${token('author')}`]);
  expect(actions).toEqual([{ type: ClientAction.CLOSE, payload: null }]);
  expect(await roomIsRunning(room)).toBe(false);
  await closeRoom(room);
});

it.each([
  { status: 401, body: 'Unauthorized' },
  { status: 400, body: 'Unrelated invalid request' },
  { status: 500, body: 'Server failure' },
])('propagates unexpected public handshake failures: $status', async failure => {
  deny = failure;
  await expect(roomIsRunning(room)).rejects.toThrow(`returned ${failure.status}`);
});

it('keeps waiting during a closing handshake rather than accepting it as closed', async () => {
  deny = { status: 503, body: 'Service Unavailable' };
  expect(await roomIsRunning(room)).toBe(true);
  deny = { status: 400, body: 'No room found' };
  expect(await roomIsRunning(room)).toBe(false);
});

it('rejects malformed room messages', async () => {
  invalid = true;
  await expect(captureRoom(room)).rejects.toThrow();
});
