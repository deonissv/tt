import { WebSocket } from 'ws';
import { PRECISION_EPSILON } from './constants';

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

export const range = (start = 0, end: number, step = 1): number[] => {
  return Array.from({ length: Math.floor((end - start) / step) }, (_, i) => start + i * step);
};
export const omitKeys = <T extends object>(obj: T, keys: (keyof T)[]): any => {
  return Object.values(obj).reduce((acc, key: keyof T) => {
    if (!keys.includes(key)) {
      Object.assign(acc, obj[key]);
    }
    return acc as object;
  }, {});
};
