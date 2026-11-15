import { Quaternion, Vector3 } from '@babylonjs/core';
import type { ServerBase } from '../actors';
import { flip, pick, rotate } from './transform';

const quarter = Math.PI / 2;

function heldActor(rotation: number[]): ServerBase {
  return {
    absoluteRotationQuaternion: Quaternion.FromEulerAngles(...(rotation as [number, number, number])),
    flipped: false,
  } as unknown as ServerBase;
}

function expectOrientation(actor: ServerBase, rotation: number[]): void {
  const expected = Quaternion.FromEulerAngles(...(rotation as [number, number, number]));
  for (const axis of [Vector3.Right(), Vector3.Up(), Vector3.Forward()]) {
    const actualAxis = axis.applyRotationQuaternion(actor.__targetRotation!);
    const expectedAxis = axis.applyRotationQuaternion(expected);
    expect(Vector3.Distance(actualAxis, expectedAxis)).toBeLessThan(0.000001);
  }
}

describe('held actor transforms', () => {
  it('uses the actor pickup policy during shared physics setup', () => {
    const rotation = Quaternion.FromEulerAngles(0.3, 0.6, 0.9);
    const getPickRotation = vi.fn().mockReturnValue(rotation);
    const actor = {
      picked: null,
      position: Vector3.Zero(),
      body: {
        setLinearVelocity: vi.fn(),
        setAngularVelocity: vi.fn(),
        setGravityFactor: vi.fn(),
        setCollisionCallbackEnabled: vi.fn(),
        shape: { isTrigger: false },
      },
      hk: { setActivationControl: vi.fn() },
      getPickRotation,
    } as unknown as ServerBase;

    pick(actor, 'player', 2, getPickRotation);

    expect(getPickRotation).toHaveBeenCalledOnce();
    expect(actor.__targetRotation).toBe(rotation);
    expect(actor.picked).toBe('player');
    expect(actor.pickHeight).toBe(2);
    expect(actor.body.shape!.isTrigger).toBe(true);
  });

  it.each([
    { angle: quarter, expected: [-quarter, quarter, 0] },
    { angle: -quarter, expected: [quarter, -quarter, 0] },
  ])('rotates a tilted actor by $angle around its local Y axis', ({ angle, expected }) => {
    const actor = heldActor([0, 0, quarter]);
    rotate(actor, angle);
    expectOrientation(actor, expected);
  });

  it.each([
    { before: [0, 0, quarter], after: [0, Math.PI, quarter] },
    { before: [0, quarter, 0], after: [Math.PI, quarter, 0] },
  ])('flips $before around its local X axis', ({ before, after }) => {
    const actor = heldActor(before);
    flip(actor);
    expectOrientation(actor, after);
    expect(actor.flipped).toBe(true);
  });
});
