import { getRandomInt, omitKeys } from '@tt/utils';

describe('utils', () => {
  describe('getRandomInt', () => {
    it('should return a random integer between the specified minimum and maximum values', () => {
      const min = 1;
      const max = 10;
      const result = getRandomInt(min, max);

      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });
  });

  describe('omitKeys', () => {
    it('should omit the specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };

      expect(omitKeys(obj, ['b'])).toStrictEqual({ a: 1, c: 3 });
      expect(omitKeys(obj, ['a', 'c'])).toStrictEqual({ b: 2 });
    });

    it('should return an equal object when no keys are omitted', () => {
      const obj = { a: 1, b: 'two', c: [3] };

      expect(omitKeys(obj, [])).toStrictEqual(obj);
    });

    it('should return an empty object when all keys are omitted', () => {
      const obj = { a: 1, b: 2 };

      expect(omitKeys(obj, ['a', 'b'])).toStrictEqual({});
    });

    it('should preserve non-omitted values by reference without mutating the input', () => {
      const nested = { x: 1 };
      const obj = { keep: nested, drop: 'gone' };

      const result = omitKeys(obj, ['drop']);

      expect(result.keep).toBe(nested);
      expect(obj).toStrictEqual({ keep: nested, drop: 'gone' });
    });

    it('should distinguish keys from values', () => {
      const obj = { a: 'b', b: 'a' };

      expect(omitKeys(obj, ['a'])).toStrictEqual({ b: 'a' });
    });
  });
});
