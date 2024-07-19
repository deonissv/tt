import * as fs from 'fs';
import * as path from 'path';

import { WebSocket } from 'ws';
import { PRECISION_EPSILON } from './constants';

export type OpnitalAllBut<T, K extends keyof T> = Required<Pick<T, K>> & Omit<Partial<T>, K>;
export type Optinal<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const isObject = (obj: any): obj is object => obj && typeof obj === 'object' && !Array.isArray(obj);

export const deepSubtractObjects = (obj1: object, obj2: object): object => {
  const result = {};

  for (const key in obj1) {
    if (isObject(obj1[key]) && isObject(obj2[key])) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      result[key] = deepSubtractObjects(obj1[key], obj2[key]);
      // eslint-disable-next-line no-prototype-builtins
    } else if (obj2.hasOwnProperty(key)) {
      result[key] = obj1[key] - obj2[key];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result[key] = obj1[key];
    }
  }

  for (const key in obj2) {
    // eslint-disable-next-line no-prototype-builtins
    if (!obj1.hasOwnProperty(key)) {
      result[key] = -obj2[key];
    }
  }

  return result;
};

export async function initHavok() {
  const HavokPhysics = await import('@babylonjs/havok');
  const hp = (process.env.NODE_ENV === 'test' ? HavokPhysics.default : HavokPhysics) as unknown as (
    object,
  ) => Promise<object>;
  const wasm = path.join(path.resolve(), '../../static/HavokPhysics.wasm');
  const wasmBinary = fs.readFileSync(wasm);

  global.havok = await hp({ wasmBinary });
}
