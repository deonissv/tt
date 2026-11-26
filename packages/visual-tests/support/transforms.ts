import { orientationDistanceRadians } from './orientation';

interface TransformObservation {
  guid: string;
  transformation?: { position?: unknown; rotation?: unknown };
}

function isFiniteVector(value: unknown): value is [number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    [0, 1, 2].every(index => {
      const component: unknown = value[index];
      return typeof component === 'number' && Number.isFinite(component);
    })
  );
}

export const transformVector = (actor: TransformObservation, field: 'position' | 'rotation'): number[] => {
  const vector = actor.transformation?.[field];
  if (!isFiniteVector(vector)) {
    throw new Error(`Actor ${actor.guid} ${field} must contain three finite numbers`);
  }
  return vector;
};

export const positionChanged = (before: TransformObservation, current: TransformObservation): boolean => {
  const left = transformVector(before, 'position');
  const right = transformVector(current, 'position');
  return Math.hypot(...left.map((value, index) => value - right[index])) > 0.01;
};

export const rotationChanged = (before: TransformObservation, current: TransformObservation): boolean =>
  orientationDistanceRadians(transformVector(before, 'rotation'), transformVector(current, 'rotation')) > 0.01;
