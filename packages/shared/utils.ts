import { PRECISION_EPSILON } from '.';
import { WebSocket } from 'ws';

export function floatCompare(a: number, b: number, epsilon = PRECISION_EPSILON): boolean {
  return Math.abs(a - b) < epsilon;
}

export async function wsConnect(url: string, protocol?: string | string[]): Promise<WebSocket> {
  const ws = new WebSocket(url, protocol);
  return new Promise((resolve, reject) => {
    ws.onopen = () => {
      resolve(ws);
    };
    ws.onerror = err => {
      reject(err);
    };
  });
}
