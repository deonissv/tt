import { Quaternion, Vector2, Vector3 } from '@babylonjs/core';
import { ActorType, type DieBaseState } from '@tt/states';
import { PRECISION_EPSILON } from '@tt/utils';
import type { ServerBase } from '../actors';

function targetAxis(actor: ServerBase): Vector3 {
  const rotationVariants =
    actor.__state.type === ActorType.DIE4 ||
    actor.__state.type === ActorType.DIE6 ||
    actor.__state.type === ActorType.DIE8 ||
    actor.__state.type === ActorType.DIE10 ||
    actor.__state.type === ActorType.DIE12 ||
    actor.__state.type === ActorType.DIE20 ||
    actor.__state.type === ActorType.DIE6ROUND
      ? (actor.__state as DieBaseState).rotationValues.map(row => row.rotation)
      : [Vector3.Up().asArray()];
  const currentRotation = actor.absoluteRotationQuaternion.toEulerAngles();
  const closest = rotationVariants.reduce(
    (best, rotation) => {
      const distance = Vector3.DistanceSquared(currentRotation, Vector3.FromArray(rotation));
      return distance < best.distance ? { rotation, distance } : best;
    },
    { rotation: null as number[] | null, distance: Infinity },
  ).rotation;
  return closest ? Vector3.FromArray(closest) : Vector3.Up();
}

function alignToAxis(quaternion: Quaternion, target: Vector3): Quaternion {
  // An upright die face has a zero rotation, which cannot define a rotation axis.
  if (target.lengthSquared() === 0) return quaternion;
  const current = Vector3.Up().applyRotationQuaternion(quaternion);
  target.normalize();

  if (Vector3.Distance(current, target) < PRECISION_EPSILON) return quaternion;
  if (Vector3.Distance(current, target.scale(-1)) < PRECISION_EPSILON) {
    const perpendicular = Vector3.Cross(current, Vector3.Right());
    if (perpendicular.length() < PRECISION_EPSILON) perpendicular.copyFromFloats(0, 0, 1);
    return Quaternion.RotationAxis(perpendicular, Math.PI).multiply(quaternion);
  }

  const axis = Vector3.Cross(current, target).normalize();
  const angle = Math.acos(Vector3.Dot(current, target));
  return Quaternion.RotationAxis(axis, angle).multiply(quaternion).normalize();
}

export function pick(actor: ServerBase, clientId: string, pickHeight: number): void {
  if (actor.picked) return;

  actor.body.setLinearVelocity(Vector3.Zero());
  actor.body.setAngularVelocity(Vector3.Zero());
  actor.pickHeight = pickHeight;
  actor.__targetPosition = new Vector2(actor.position.x, actor.position.z);

  const rotation = actor.absoluteRotationQuaternion;
  actor.__targetRotation =
    actor.__state.type === ActorType.CARD || actor.__state.type === ActorType.DECK
      ? rotation
      : alignToAxis(rotation, targetAxis(actor));
  actor.picked = clientId;
  actor.body.setCollisionCallbackEnabled(false);
  actor.body.shape!.isTrigger = true;
}

export function release(actor: ServerBase): void {
  actor.picked = null;
  actor.pickHeight = 0;
  actor.__targetPosition = null;
  actor.body.setCollisionCallbackEnabled(true);
  actor.body.shape!.isTrigger = false;
}

export function move(actor: ServerBase, dx: number, dy: number): void {
  actor.__targetPosition?.addInPlaceFromFloats(dx, dy);
}

export function flip(actor: ServerBase): void {
  const rotation = Quaternion.RotationAxis(Vector3.Right(), Math.PI);
  actor.__targetRotation = actor.absoluteRotationQuaternion.multiply(rotation);
  actor.flipped = !actor.flipped;
}

export function rotate(actor: ServerBase, angle: number): void {
  actor.__targetRotation = actor.absoluteRotationQuaternion.multiply(Quaternion.RotationAxis(Vector3.Up(), angle));
}
