import type { UnknownActorState } from '@tt/states';
import { describe, expect, it } from 'vitest';
import { positionChanged, rotationChanged } from './transforms';

const state = (field: string, vector: unknown): UnknownActorState =>
  ({ guid: 'actor', transformation: { [field]: vector } }) as unknown as UnknownActorState;

describe.each([
  { field: 'position', changed: positionChanged },
  { field: 'rotation', changed: rotationChanged },
])('$field validation', ({ field, changed }) => {
  it.each(
    [undefined, [], new Array<number>(3), [0, 0], [0, 0, 0, 0], [NaN, 0, 0], [Infinity, 0, 0], ['0', 0, 0]].map(
      vector => ({ vector }),
    ),
  )('rejects invalid vector $vector on either side', ({ vector }) => {
    const invalid = state(field, vector);
    const valid = state(field, [0, 0, 0]);
    expect(() => changed(invalid, valid)).toThrow('finite');
    expect(() => changed(valid, invalid)).toThrow('finite');
  });
});

it('requires real movement beyond the position threshold', () => {
  const before = state('position', [0, 0, 0]);
  expect(positionChanged(before, state('position', [0.01, 0, 0]))).toBe(false);
  expect(positionChanged(before, state('position', [0.02, 0, 0]))).toBe(true);
});

it('compares physical orientation rather than Euler representation', () => {
  const before = state('rotation', [0, 0, 0]);
  expect(rotationChanged(before, state('rotation', [2 * Math.PI, 0, 0]))).toBe(false);
  expect(rotationChanged(before, state('rotation', [0, Math.PI / 2, 0]))).toBe(true);
});
