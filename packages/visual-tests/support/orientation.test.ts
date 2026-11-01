import { describe, expect, it } from 'vitest';
import { orientationDistanceRadians } from './orientation';

const quarter = Math.PI / 2;

describe('public orientation measurements', () => {
  it('recognizes equivalent Euler descriptions and measures a known angular difference', () => {
    expect(orientationDistanceRadians([0, 0, 0], [2 * Math.PI, 0, 0])).toBe(0);
    expect(orientationDistanceRadians([0, 0, 0], [0, quarter, 0])).toBeCloseTo(quarter);
    expect(orientationDistanceRadians([0, 0, quarter], [Math.PI, Math.PI, -quarter])).toBeLessThan(0.000001);
  });
});
