import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Tuple } from '@babylonjs/core/types';
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
      reject(new Error(err.message));
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

export const degToRad = (deg: number): number => deg * (Math.PI / 180);
export const meshSizes = (mesh: Mesh) => {
  const vectorsWorld = mesh.getBoundingInfo().boundingBox.vectorsWorld;
  const width = Math.abs(vectorsWorld[1].x - vectorsWorld[0].x);
  const height = Math.abs(vectorsWorld[1].y - vectorsWorld[0].y);
  const depth = Math.abs(vectorsWorld[1].z - vectorsWorld[0].z);
  return { width, height, depth };
};

export const vecDelta = (curr: Tuple<number, 3>, prev: Tuple<number, 3>): Tuple<number, 3> => {
  return [curr[0] - prev[0], curr[1] - prev[1], curr[2] - prev[2]];
};

export const vecFloatCompare = <N extends number>(
  a: Tuple<number, N>,
  b: Tuple<number, N>,
  epsilon = PRECISION_EPSILON,
): boolean => {
  return Array.prototype.some.call(
    a,
    (v: number, i: number) => !floatCompare(v, b[i as keyof typeof b] as number, epsilon),
  );
};

/**
 * Generates a random integer between the specified minimum and maximum values.
 *
 * @param min  - The minimum value of the range (inclusive).
 * @param max - The maximum value of the range (inclusive).
 * @returns A random integer between the specified minimum and maximum values.
 */
export function getRandomInt(min: number, max: number) {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const randomNumber = randomBuffer[0] / (0xffffffff + 1);
  return Math.floor(randomNumber * (max - min)) + min;
}

/**
 * Checks if a given string is a valid URL.
 *
 * @param urlString - The string to be checked.
 * @returns `true` if the string is a valid URL, `false` otherwise.
 */
export const isURL = (urlString: string): boolean => {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

/**
 * Shuffles the elements in the given array in place.
 *
 * @param array - The array to be shuffled.
 * @returns The shuffled array.
 * @template T - The type of elements in the array.
 */
export const shuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Checks if a string is a valid UUID v4.
 *
 * @param uuid - The string to be checked.
 * @returns `true` if the string is a valid UUID, `false` otherwise.
 */
export const isUUIDv4 = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
};
