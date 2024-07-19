import { describe, expect, it } from 'vitest';
import { deepSubtractObjects } from '../src/utils';

describe('deepSubtractObjects', () => {
  it('should subtract two flat objects correctly', () => {
    const obj1 = { a: 10, b: 20, c: 30 };
    const obj2 = { a: 5, b: 10, c: 15 };
    const expectedResult = { a: 5, b: 10, c: 15 };
    expect(deepSubtractObjects(obj1, obj2)).toEqual(expectedResult);
  });

  it('should handle subtraction with missing keys in the second object', () => {
    const obj1 = { a: 10, b: 20, c: 30 };
    const obj2 = { a: 5 };
    const expectedResult = { a: 5, b: 20, c: 30 };
    expect(deepSubtractObjects(obj1, obj2)).toEqual(expectedResult);
  });

  it('should handle subtraction with additional keys in the second object', () => {
    const obj1 = { a: 10 };
    const obj2 = { a: 5, b: 10, c: 15 };
    const expectedResult = { a: 5, b: -10, c: -15 };
    expect(deepSubtractObjects(obj1, obj2)).toEqual(expectedResult);
  });

  it('should subtract nested objects correctly', () => {
    const obj1 = { a: 10, b: { x: 20, y: 30 }, c: 40 };
    const obj2 = { a: 5, b: { x: 10, y: 15 }, c: 20 };
    const expectedResult = { a: 5, b: { x: 10, y: 15 }, c: 20 };
    expect(deepSubtractObjects(obj1, obj2)).toEqual(expectedResult);
  });

  it('should handle subtraction with nested objects having additional keys', () => {
    const obj1 = { a: 10, b: { x: 20 } };
    const obj2 = { a: 5, b: { x: 10, y: 15 } };
    const expectedResult = { a: 5, b: { x: 10, y: -15 } };
    expect(deepSubtractObjects(obj1, obj2)).toEqual(expectedResult);
  });

  it('should handle subtraction with nested objects missing in the second object', () => {
    const obj1 = {
      a: 10,
      b: {
        x: 20,
        y: 30,
      },
    };
    const obj2 = { a: 5 };
    const expectedResult = {
      a: 5,
      b: {
        x: 20,
        y: 30,
      },
    };
    expect(deepSubtractObjects(obj1, obj2)).toEqual(expectedResult);
  });
});
