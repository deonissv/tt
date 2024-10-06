import { Tuple } from './types';

export const PRECISION_EPSILON = 0.001;
export function floatCompare(a: number, b: number, epsilon = PRECISION_EPSILON): boolean {
  return Math.abs(a - b) < epsilon;
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

export const radToDeg = (rad: number): number => rad * (180 / Math.PI);
export const degToRad = (deg: number): number => deg * (Math.PI / 180);
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

/**
 * Checks if the provided string is a valid email address.
 *
 * This function uses a regular expression to validate the email format.
 *
 * @param email - The email address to validate.
 * @returns `true` if the email is valid, `false` otherwise.
 */
export const isEmail = (email: string): boolean => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase(),
  );
};

/**
 * Generates a UUID version 4 string.
 *
 * @returns {string} A randomly generated UUIDv4 string.
 */
export const UUIDv4 = () => {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
  );
};

/**
 * Converts an ArrayBuffer to a Base64-encoded data URL.
 *
 * @param buffer - The ArrayBuffer to convert.
 * @returns A string representing the Base64-encoded data URL.
 */
export const getB64URL = (buffer: ArrayBuffer) => {
  const b64 = btoa(
    Array.from(new Uint8Array(buffer))
      .map(b => String.fromCharCode(b))
      .join(''),
  );
  return `data:;base64,${b64}`;
};

/**
 * Asynchronously waits for the specified delay.
 * @param delay - The delay in milliseconds.
 * @returns A promise that resolves after the specified delay.
 */
export async function wait(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

export type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): DebouncedFunction<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };
};
