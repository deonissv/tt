import {
  getB64URL,
  getRandomInt,
  hasProperty,
  hasOwnProperty,
  isArray,
  isNumber,
  isObject,
  isString,
  isTuple,
  isUnknownObject,
  omitKeys,
} from '@tt/utils';

const encodeLegacyBrowser = (buffer: ArrayBuffer): string => {
  class LegacyBytes extends Uint8Array {
    toBase64 = undefined;
  }
  vi.stubGlobal('Uint8Array', LegacyBytes);
  vi.stubGlobal('Buffer', undefined);
  try {
    return getB64URL(buffer);
  } finally {
    vi.unstubAllGlobals();
  }
};

describe('utils', () => {
  describe.each([
    ['Node', getB64URL],
    ['legacy browser', encodeLegacyBrowser],
  ] as const)('getB64URL in %s', (_platform, encode) => {
    it.each([0, 1, 2, 3, 256, 24_575, 24_576, 24_577, 49_153, 2 * 1024 * 1024 + 1])(
      'preserves all binary bytes and Base64 padding for a %i-byte buffer',
      length => {
        const bytes = new Uint8Array(length);
        for (let index = 0; index < length; index++) bytes[index] = (index * 31 + 127) & 255;
        const original = bytes.slice();
        expect(encode(bytes.buffer)).toBe(`data:;base64,${Buffer.from(original).toString('base64')}`);
        expect(Buffer.compare(bytes, original)).toBe(0);
      },
    );
  });

  it('uses the native typed-array encoder with the original bytes', () => {
    const encoded: number[][] = [];
    class NativeBytes extends Uint8Array {
      toBase64() {
        encoded.push(Array.from(this));
        return Buffer.from(this).toString('base64');
      }
    }
    const buffer = new Uint8Array([0, 128, 255, 1]).buffer;
    vi.stubGlobal('Uint8Array', NativeBytes);
    try {
      expect(getB64URL(buffer)).toBe('data:;base64,AID/AQ==');
      expect(encoded).toEqual([[0, 128, 255, 1]]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  describe('getRandomInt', () => {
    it('should return a random integer between the specified minimum and maximum values', () => {
      const min = 1;
      const max = 10;
      const result = getRandomInt(min, max);

      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });
  });

  describe('type guards', () => {
    it('isString', () => {
      expect(isString('text')).toBe(true);
      expect(isString(42)).toBe(false);
      expect(isString(null)).toBe(false);
    });

    it('isNumber', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber('5')).toBe(false);
      expect(isNumber(null)).toBe(false);
    });

    it('isArray', () => {
      expect(isArray([1])).toBe(true);
      expect(isArray({ length: 1 })).toBe(false);
    });

    it('isObject', () => {
      expect(isObject({})).toBe(true);
      expect(isObject(null)).toBe(false);
      expect(isObject([1])).toBe(false);
      expect(isObject('text')).toBe(false);
    });

    it('isUnknownObject', () => {
      expect(isUnknownObject({ a: 1 })).toBe(true);
      expect(isUnknownObject(null)).toBe(false);
    });

    it('hasProperty matches inherited properties', () => {
      const object = Object.create({ inherited: true }) as { inherited?: boolean; own?: number };
      object.own = 1;

      expect(hasProperty(object, 'own')).toBe(true);
      expect(hasProperty(object, 'inherited')).toBe(true);
      expect(hasProperty(object, 'missing')).toBe(false);
    });

    it('hasOwnProperty ignores inherited properties', () => {
      const object = Object.create({ inherited: true }) as { inherited?: boolean; own?: number };
      object.own = 1;

      expect(hasOwnProperty(object, 'own')).toBe(true);
      expect(hasOwnProperty(object, 'inherited')).toBe(false);
    });

    it('isTuple checks the exact size', () => {
      expect(isTuple([1, 2, 3], 3)).toBe(true);
      expect(isTuple([1, 2], 3)).toBe(false);
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
