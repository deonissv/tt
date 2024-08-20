import { getRandomInt } from '@shared/utils';

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
});
