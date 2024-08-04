import type { Tuple } from '@babylonjs/core/types';
import type { UnknownObject } from './types';

export const isString = (str: unknown): str is string => typeof str === 'string';
export const isNumber = (num: unknown): num is number => typeof num === 'number';
export const isArray = <T>(arr: unknown): arr is T[] => Array.isArray(arr);
export const isObject = (obj: unknown): obj is object => Boolean(obj) && typeof obj === 'object' && !Array.isArray(obj);
export const isUnknownObject = (obj: unknown): obj is UnknownObject => isObject(obj);

export const hasProperty = <K extends string>(object: object, key: K): object is { [P in K]: unknown } => {
  return key in object;
};

export const hasOwnProperty = <T, K extends keyof T>(object: T, key: K): object is T & { [P in K]: unknown } => {
  return Object.prototype.hasOwnProperty.call(object, key);
};

export const isTuple = <T, N extends number>(array: T[], size: N): array is Tuple<T, N> => {
  return array.length === size;
};
