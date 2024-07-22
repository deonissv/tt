/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

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

export const isObject = (obj: any): obj is object => obj && typeof obj === 'object' && !Array.isArray(obj);

export const deepSubtractObjects = (obj1: any, obj2: any): object => {
  const result = {};

  for (const key in obj1) {
    if (isObject(obj1[key]) && isObject(obj2[key])) {
      result[key] = deepSubtractObjects(obj1[key], obj2[key]);
    } else if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      result[key] = obj1[key] - obj2[key];
    } else {
      result[key] = obj1[key];
    }
  }

  for (const key in obj2) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
      result[key] = -obj2[key];
    }
  }

  return result;
};
