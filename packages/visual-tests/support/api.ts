import { expect } from '@playwright/test';
import { ClientAction, ServerAction, type DownloadProgressPld, type ServerActionMsg } from '@tt/actions';
import type { SimulationState, SimulationStateSave } from '@tt/states';
import WebSocket, { type RawData } from 'ws';
import type { RoomFixture } from '../fixtures/dataset';

export interface RoomSnapshot {
  state: SimulationStateSave;
  downloadProgress: DownloadProgressPld;
}

export type Room = Pick<RoomFixture, 'roomCode' | 'authorToken' | 'observerToken'> & { origin: string };

class RoomNotRunning extends Error {}
class RoomClosing extends Error {}

export const captureRoom = async (room: Room): Promise<RoomSnapshot> => {
  // A separate observer cannot release an actor held by either tested player.
  const { downloadProgress, ...state } = (await exchangeRoom(room.origin, room.roomCode, room.observerToken))!;
  return { downloadProgress, state };
};

export const roomIsRunning = async (room: Room): Promise<boolean> => {
  try {
    await captureRoom(room);
    return true;
  } catch (error) {
    if (error instanceof RoomNotRunning) return false;
    if (error instanceof RoomClosing) return true;
    throw error;
  }
};

export const closeRoom = async (room: Room): Promise<void> => {
  try {
    await exchangeRoom(room.origin, room.roomCode, room.authorToken, true);
  } catch (error) {
    if (!(error instanceof RoomNotRunning) && !(error instanceof RoomClosing)) throw error;
  }
  await expect.poll(() => roomIsRunning(room), { timeout: 30_000 }).toBe(false);
};

// STATE and CLOSE are the same authenticated wire protocol used by the client.
// No application classes, test endpoints, or reconstructed simulation are used.
function exchangeRoom(origin: string, roomCode: string, token: string, close = false): Promise<SimulationState | null> {
  const url = new URL(`/api/v1/ws/${roomCode}`, origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, `Bearer.${token}`, { handshakeTimeout: 10_000 });
    let settled = false;
    let result: SimulationState | null | undefined;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) {
        reject(error);
        socket.terminate();
      } else resolve(result!);
    };
    const timer = setTimeout(() => finish(new Error(`Room ${roomCode} did not answer its public connection`)), 120_000);
    socket.on('error', error => finish(error));
    socket.on('unexpected-response', (_request, response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => (body += String(chunk)));
      response.on('end', () => finish(connectionError(roomCode, response.statusCode, body)));
    });
    socket.on('message', data => {
      try {
        const messages = JSON.parse(wireText(data)) as ServerActionMsg[];
        for (const message of messages) {
          if (message.type === ServerAction.STATE) {
            if (close) socket.send(JSON.stringify([{ type: ClientAction.CLOSE, payload: null }]));
            else {
              result = message.payload;
              socket.close();
            }
          } else if (close && message.type === ServerAction.CLOSED) {
            result = null;
            socket.close();
          }
        }
      } catch (error) {
        finish(error instanceof Error ? error : new Error(String(error)));
      }
    });
    socket.on('close', () =>
      finish(result === undefined ? new Error(`Room ${roomCode} closed without a response`) : undefined),
    );
  });
}

function wireText(data: RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data.map(chunk => new Uint8Array(chunk))).toString('utf8');
  if (Buffer.isBuffer(data)) return data.toString('utf8');
  return Buffer.from(data).toString('utf8');
}

function connectionError(roomCode: string, status: number | undefined, body: string): Error {
  if (status === 400 && body === 'No room found') return new RoomNotRunning(`Room ${roomCode} is not running`);
  if (status === 503 && body === 'Service Unavailable') return new RoomClosing(`Room ${roomCode} is closing`);
  return new Error(`Room connection returned ${status}: ${body}`);
}
