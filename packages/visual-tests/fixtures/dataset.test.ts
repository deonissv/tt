import { request, type APIRequestContext } from '@playwright/test';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { createDataset } from './dataset';

let api: APIRequestContext;
let shutdown: () => Promise<void>;
let calls: { method: string; path: string; token?: string; body: Record<string, unknown> }[];
let rejectPath: string | undefined;
let tokens: string[];

beforeEach(async () => {
  calls = [];
  tokens = [];
  rejectPath = undefined;
  const server = createServer((req, res) => {
    let data = '';
    req.on('data', chunk => {
      data += String(chunk);
    });
    req.on('end', () => {
      const path = req.url!;
      calls.push({
        method: req.method!,
        path,
        token: req.headers.authorization,
        body: data ? (JSON.parse(data) as Record<string, unknown>) : {},
      });
      if (path === rejectPath) {
        res.writeHead(503);
        res.end('Unavailable');
        return;
      }
      if (req.method === 'DELETE') {
        res.end('{}');
        return;
      }
      if (path.endsWith('/auth/signup')) {
        const code = `user-${tokens.length + 1}`;
        const token = `header.${Buffer.from(JSON.stringify({ code })).toString('base64url')}.server-signature`;
        tokens.push(token);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ access_token: token }));
      } else if (path.endsWith('/games')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ code: 'created-game' }));
      } else if (path.endsWith('/rooms')) res.end('created-room');
      else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  api = await request.newContext({ baseURL: `http://127.0.0.1:${(server.address() as AddressInfo).port}` });
  shutdown = async () => {
    await api.dispose();
    await new Promise<void>((resolve, reject) => server.close(error => (error ? reject(error) : resolve())));
  };
});

afterEach(async () => {
  await shutdown();
});

it('creates real API identities and submits the reviewed save unchanged', async () => {
  const scene = { actorStates: [] };
  const dataset = await createDataset(api, scene);
  const room = { ...dataset, roomCode: await dataset.createRoom() };
  expect([room.authorToken, room.observerToken]).toEqual([tokens[0], tokens[2]]);
  expect(room.roomCode).toBe('created-room');
  const signup = calls.filter(call => call.path.endsWith('/auth/signup'));
  expect(signup).toHaveLength(3);
  expect(new Set(signup.map(call => call.body.email)).size).toBe(3);
  expect(room.guestLogin).toEqual({ email: signup[1].body.email, password: signup[1].body.password });
  const game = calls.find(call => call.path.endsWith('/games'))!;
  expect(game.token).toBe(`Bearer ${tokens[0]}`);
  expect(JSON.parse(game.body.content as string)).toEqual(scene);
  expect(calls.at(-1)).toMatchObject({ path: '/api/v1/rooms', body: { gameCode: 'created-game' } });
  await room.cleanup();
});

it('deletes only created resources through their owning identities and permits repeated cleanup', async () => {
  const dataset = await createDataset(api, { actorStates: [] });
  const room = { ...dataset, roomCode: await dataset.createRoom() };
  await room.cleanup();
  const deleted = calls.filter(call => call.method === 'DELETE');
  expect(deleted.map(call => call.path)).toEqual([
    '/api/v1/rooms/created-room',
    '/api/v1/games/created-game',
    '/api/v1/users/user-3',
    '/api/v1/users/user-2',
    '/api/v1/users/user-1',
  ]);
  expect(deleted.map(call => call.token)).toEqual(
    [tokens[0], tokens[0], tokens[2], tokens[1], tokens[0]].map(token => `Bearer ${token}`),
  );
  await room.cleanup();
  expect(calls.filter(call => call.method === 'DELETE')).toHaveLength(5);
});

it('omits the guest account for a single-player case', async () => {
  const dataset = await createDataset(api, { actorStates: [] }, false);
  const room = { ...dataset, roomCode: await dataset.createRoom() };
  expect(room.guestLogin).toBeUndefined();
  expect(tokens).toHaveLength(2);
  expect(room.observerToken).toBe(tokens[1]);
  await room.cleanup();
});

it.each(['/api/v1/games', '/api/v1/rooms'])('cleans up partial setup when %s is unavailable', async path => {
  rejectPath = path;
  if (path.endsWith('/rooms')) {
    const dataset = await createDataset(api, { actorStates: [] });
    await expect(dataset.createRoom()).rejects.toThrow('creation failed');
    await dataset.cleanup();
  } else await expect(createDataset(api, { actorStates: [] })).rejects.toThrow('creation failed');
  const deleted = calls.filter(call => call.method === 'DELETE').map(call => call.path);
  expect(deleted.filter(path => path.startsWith('/api/v1/users/'))).toHaveLength(3);
  expect(deleted.includes('/api/v1/games/created-game')).toBe(path.endsWith('/rooms'));
  expect(deleted.some(path => path.startsWith('/api/v1/rooms/'))).toBe(false);
});

it('propagates signup failures before creating any game or room', async () => {
  rejectPath = '/api/v1/auth/signup';
  await expect(createDataset(api, { actorStates: [] })).rejects.toThrow('signup failed');
  expect(calls).toHaveLength(1);
});

it('continues cleanup after a failed deletion and retries only the remaining resource', async () => {
  const dataset = await createDataset(api, { actorStates: [] });
  const room = { ...dataset, roomCode: await dataset.createRoom() };
  rejectPath = '/api/v1/rooms/created-room';
  await expect(room.cleanup()).rejects.toThrow('cleanup failed');
  expect(calls.filter(call => call.method === 'DELETE')).toHaveLength(5);
  rejectPath = undefined;
  await room.cleanup();
  expect(calls.at(-1)?.path).toBe('/api/v1/rooms/created-room');
  expect(calls.filter(call => call.method === 'DELETE')).toHaveLength(6);
});

it('defers room startup until browser players have signed in', async () => {
  const dataset = await createDataset(api, { actorStates: [] });
  expect(calls.some(call => call.path === '/api/v1/rooms')).toBe(false);
  await dataset.createRoom();
  expect(calls.at(-1)?.path).toBe('/api/v1/rooms');
  await dataset.cleanup();
});
