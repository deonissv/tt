import type { UnknownActorState } from '@tt/states';
import { describe, expect as check, it } from 'vitest';
import { expect } from './expect';

const actor = (rotation = [0, 0, 0]): UnknownActorState =>
  ({ guid: 'actor', transformation: { rotation } }) as UnknownActorState;
const saved = (x = 0, name = 'saved') => ({
  actorStates: [{ guid: 'actor', name, transformation: { position: [x, 0, 0] } }],
});
const quarter = Math.PI / 2;

describe('shared Playwright expect', () => {
  it('retains built-in matchers and configured expect instances', () => {
    expect([1, 2]).toHaveLength(2);
    expect.configure({ timeout: 500 })(saved()).toMatchSimulationState(saved());
  });

  it('accepts bounded physics noise but rejects changes to discrete state', () => {
    expect(saved(0.015)).toMatchSimulationState(saved(), { position: 0.02 });
    check(() => expect(saved(0.021)).toMatchSimulationState(saved(), { position: 0.02 })).toThrow(
      'actorStates[guid=actor].transformation.position[0]',
    );
    check(() => expect(saved(0, 'lost')).toMatchSimulationState(saved())).toThrow('actorStates[guid=actor].name');
  });

  it('reports the caller message along with the mismatched state path', () => {
    const assertion = () => expect(saved(1), 'restored room differs').toMatchSimulationState(saved());
    check(assertion).toThrow('restored room differs');
    check(assertion).toThrow('actorStates[guid=actor].transformation.position[0]');
  });

  it('supports negation without reversing the underlying comparison twice', () => {
    expect(saved(1)).not.toMatchSimulationState(saved());
    check(() => expect(saved()).not.toMatchSimulationState(saved())).toThrow(
      'Expected the simulation states to differ',
    );
  });

  it('can poll fresh public state using the same matcher', async () => {
    let reads = 0;
    await expect
      .poll(() => saved(++reads === 1 ? 1 : 0), { timeout: 500, intervals: [1] })
      .toMatchSimulationState(saved());
    check(reads).toBe(2);
  });

  it.each([
    { key: 'KeyE', rotation: [0, Math.PI / 18, 0] },
    { key: 'KeyQ', rotation: [0, -Math.PI / 18, 0] },
    { key: 'KeyF', rotation: [Math.PI, 0, 0] },
  ] as const)('accepts the public $key rotation contract', ({ key, rotation }) => {
    expect(actor([...rotation])).toHaveHeldRotation(actor(), key);
    check(() => expect(actor([...rotation])).not.toHaveHeldRotation(actor(), key)).toThrow('held transform');
  });

  it('supports a configured rotation step and rejects the default step in its place', () => {
    expect(actor([0, Math.PI / 4, 0])).toHaveHeldRotation(actor(), 'KeyE', { rotationStep: Math.PI / 4 });
    check(() =>
      expect(actor([0, Math.PI / 18, 0])).toHaveHeldRotation(actor(), 'KeyE', { rotationStep: Math.PI / 4 }),
    ).toThrow('held transform KeyE');
  });

  it.each([
    { before: [0, 0, 0], after: [0, quarter, 0], key: 'KeyE' },
    { before: [0, 0, quarter], after: [-quarter, quarter, 0], key: 'KeyE' },
    { before: [0, 0, quarter], after: [quarter, -quarter, 0], key: 'KeyQ' },
    { before: [0, quarter, 0], after: [Math.PI, quarter, 0], key: 'KeyF' },
    { before: [0, 0, quarter], after: [0, Math.PI, quarter], key: 'KeyF' },
  ] as const)('measures the specified local rotation from $before to $after', ({ before, after, key }) => {
    expect(actor([...after])).toHaveHeldRotation(actor([...before]), key, {
      rotationStep: quarter,
      tolerance: 0.000001,
    });
  });

  it('rejects rotating around the world axis instead of the held object local axis', () => {
    expect(actor([0, quarter, quarter])).not.toHaveHeldRotation(actor([0, 0, quarter]), 'KeyE', {
      rotationStep: quarter,
      tolerance: 1,
    });
  });

  it('rejects the wrong direction, wrong axis, and unchanged orientation for a configured step', () => {
    for (const wrong of [
      [0, -quarter, 0],
      [quarter, 0, 0],
      [0, 0, 0],
    ]) {
      expect(actor(wrong)).not.toHaveHeldRotation(actor(), 'KeyE', { rotationStep: quarter });
    }
  });

  it('rejects the wrong axis, reversed direction, and unchanged rotation', () => {
    for (const wrong of [
      [Math.PI / 18, 0, 0],
      [0, -Math.PI / 18, 0],
      [0, 0, 0],
    ]) {
      check(() => expect(actor(wrong)).toHaveHeldRotation(actor(), 'KeyE')).toThrow('local Y axis and direction');
      expect(actor(wrong)).not.toHaveHeldRotation(actor(), 'KeyE');
    }
  });

  it('propagates malformed observations even when negated', () => {
    check(() => expect(actor([NaN, 0, 0])).not.toHaveHeldRotation(actor(), 'KeyE')).toThrow('finite');
  });
});
