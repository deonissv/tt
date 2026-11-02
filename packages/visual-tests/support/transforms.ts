import type { UnknownActorState } from '@tt/states';
import { orientationDistanceRadians } from './orientation';

export const transformVector = (actor: UnknownActorState, field: 'position' | 'rotation'): number[] => {
  const vector = actor.transformation?.[field];
  if (!Array.isArray(vector) || vector.length !== 3 || ![0, 1, 2].every(index => Number.isFinite(vector[index]))) {
    throw new Error(`Actor ${actor.guid} ${field} must contain three finite numbers`);
  }
  return vector;
};

export const positionChanged = (before: UnknownActorState, current: UnknownActorState): boolean => {
  const left = transformVector(before, 'position');
  const right = transformVector(current, 'position');
  return Math.hypot(...left.map((value, index) => value - right[index])) > 0.01;
};

export const rotationChanged = (before: UnknownActorState, current: UnknownActorState): boolean =>
  orientationDistanceRadians(transformVector(before, 'rotation'), transformVector(current, 'rotation')) > 0.01;
