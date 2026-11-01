import { expect as baseExpect } from '@playwright/test';
import type { UnknownActorState } from '@tt/states';
import { basisDistanceRadians, multiplyBases, orientationBasis } from '../support/orientation';
import { transformVector } from '../support/transforms';
import { compareSnapshots } from './snapshots';

const heldRotationDeviation = (
  before: UnknownActorState,
  after: UnknownActorState,
  key: 'KeyE' | 'KeyF' | 'KeyQ',
  rotationStep: number,
): number => {
  const axis = key === 'KeyF' ? 'x' : 'y';
  let angle = rotationStep;
  if (key === 'KeyF') angle = Math.PI;
  else if (key === 'KeyQ') angle = -rotationStep;
  const initial = orientationBasis(transformVector(before, 'rotation'));
  const inverse = initial.map((_, index) => initial[(index % 3) * 3 + Math.floor(index / 3)]);
  const observed = multiplyBases(inverse, orientationBasis(transformVector(after, 'rotation')));
  const expected = orientationBasis(axis === 'x' ? [angle, 0, 0] : [0, angle, 0]);
  return basisDistanceRadians(expected, observed);
};

export const expect = baseExpect.extend({
  toMatchSimulationState(actual: unknown, expected: unknown, tolerances?: Parameters<typeof compareSnapshots>[2]) {
    const differences = compareSnapshots(expected, actual, tolerances);
    return {
      name: 'toMatchSimulationState',
      pass: differences.length === 0,
      expected,
      actual,
      message: () =>
        this.utils.matcherHint('toMatchSimulationState', undefined, undefined, { isNot: this.isNot }) +
        '\n\n' +
        (differences.length
          ? `Simulation state differs at:\n${differences.join('\n')}`
          : 'Expected the simulation states to differ within the selected transform tolerances.'),
    };
  },

  toHaveHeldRotation(
    actual: UnknownActorState,
    before: UnknownActorState,
    key: 'KeyE' | 'KeyF' | 'KeyQ',
    { rotationStep = Math.PI / 18, tolerance = 0.01 }: { rotationStep?: number; tolerance?: number } = {},
  ) {
    const deviation = heldRotationDeviation(before, actual, key, rotationStep);
    return {
      name: 'toHaveHeldRotation',
      pass: deviation < tolerance,
      expected: { key, rotationStep, tolerance },
      actual: deviation,
      message: () =>
        this.utils.matcherHint('toHaveHeldRotation', undefined, undefined, { isNot: this.isNot }) +
        '\n\n' +
        `Actor ${actual.guid} held transform ${key}: expected ${this.isNot ? 'not ' : ''}to follow its local ` +
        `${key === 'KeyF' ? 'X' : 'Y'} axis and direction.\n` +
        `Expected angular deviation: ${this.isNot ? '>=' : '<'} ${tolerance} radians\nReceived: ${deviation} radians`,
    };
  },
});
