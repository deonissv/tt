import { expect, it } from 'vitest';
import coordinates from './targeting/coordinates.json';
import initialPoses from './targeting/poses.json';
import { ACTOR_MANIFEST } from './manifest';

const profiles: Record<string, Record<string, number[]>> = coordinates.profiles;

it('contains reviewed points and finite start poses for every initial actor', () => {
  expect(Object.keys(profiles.default).sort()).toEqual(ACTOR_MANIFEST.map(actor => actor.guid).sort());
  expect(Object.keys(profiles['after-clockwise']).sort()).toEqual(ACTOR_MANIFEST.map(actor => actor.guid).sort());
  expect(Object.keys(initialPoses.profiles.default).sort()).toEqual(ACTOR_MANIFEST.map(actor => actor.guid).sort());
  for (const actors of Object.values(initialPoses.profiles)) {
    for (const pose of Object.values(actors)) {
      for (const vector of Object.values(pose)) {
        expect(vector).toHaveLength(3);
        expect(vector.every(Number.isFinite)).toBe(true);
      }
    }
  }
  for (const actors of Object.values(profiles)) {
    for (const point of Object.values(actors)) {
      expect(point).toHaveLength(2);
      expect(point.every(Number.isFinite)).toBe(true);
      expect(point[0]).toBeGreaterThanOrEqual(0);
      expect(point[0]).toBeLessThan(coordinates.viewport.width);
      expect(point[1]).toBeGreaterThanOrEqual(0);
      expect(point[1]).toBeLessThan(coordinates.viewport.height);
    }
  }
});
