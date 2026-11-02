import { orientationDistanceRadians } from '../support/orientation';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

// Only actor transforms tolerate continuous physics noise. All other values,
// including ordered container contents, must match exactly.
export function compareSnapshots(
  expected: unknown,
  actual: unknown,
  { position = 0.001, rotation = 0.001, scale = 0.001 } = {},
): string[] {
  const differences: string[] = [];
  const transform = /^actorStates\[guid=[^\]]+\]\.transformation\.(position|rotation|scale)$/;

  function indexActors(actors: unknown[]): Map<string, Record<string, unknown>> {
    const indexed = new Map<string, Record<string, unknown>>();
    for (const [index, actor] of actors.entries()) {
      if (!isRecord(actor) || typeof actor.guid !== 'string' || !actor.guid) {
        differences.push(`actorStates[${index}]`);
      } else if (indexed.has(actor.guid)) {
        differences.push(`actorStates[guid=${actor.guid}] (duplicate)`);
      } else indexed.set(actor.guid, actor);
    }
    return indexed;
  }

  function visit(left: unknown, right: unknown, path: string, epsilon = 0): void {
    if (typeof left === 'number' && typeof right === 'number') {
      if (
        !Number.isFinite(left) ||
        !Number.isFinite(right) ||
        (epsilon ? Math.abs(left - right) > epsilon : !Object.is(left, right))
      )
        differences.push(path);
    } else if (Array.isArray(left) && Array.isArray(right)) {
      const field = transform.exec(path)?.[1];
      if (field === 'rotation' && left.length === 3 && right.length === 3) {
        if (
          !left.every(isFiniteNumber) ||
          !right.every(isFiniteNumber) ||
          orientationDistanceRadians(left, right) > rotation
        )
          differences.push(path);
      } else if (path === 'actorStates') {
        const expectedActors = indexActors(left);
        const actualActors = indexActors(right);
        for (const guid of new Set([...expectedActors.keys(), ...actualActors.keys()])) {
          const actorPath = `actorStates[guid=${guid}]`;
          if (!expectedActors.has(guid) || !actualActors.has(guid)) differences.push(actorPath);
          else visit(expectedActors.get(guid), actualActors.get(guid), actorPath);
        }
      } else {
        if (left.length !== right.length) differences.push(`${path}.length`);
        let tolerance = 0;
        if (field === 'position') tolerance = position;
        if (field === 'scale') tolerance = scale;
        for (let index = 0; index < Math.max(left.length, right.length); index++) {
          visit(left[index], right[index], `${path}[${index}]`, tolerance);
        }
      }
    } else if (isRecord(left) && isRecord(right)) {
      for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
        const child = path ? `${path}.${key}` : key;
        if (!(key in left) || !(key in right)) differences.push(child);
        else visit(left[key], right[key], child);
      }
    } else if (!Object.is(left, right)) differences.push(path);
  }

  visit(expected, actual, '');
  return differences;
}
