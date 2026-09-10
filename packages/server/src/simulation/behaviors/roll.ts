import { Vector3 } from '@babylonjs/core';
import { getRandomInt } from '@tt/utils';
import type { ServerBase } from '../actors';
import { pick, release } from './transform';

const ROLL_IMPULSE_MIN = 450;
const ROLL_IMPULSE_MAX = 600;
const ROLL_ANGULAR_IMPULSE_MIN = 50;
const ROLL_ANGULAR_IMPULSE_MAX = 70;

export function roll(actor: ServerBase): void {
  const impulse = actor.mass * getRandomInt(ROLL_IMPULSE_MIN, ROLL_IMPULSE_MAX);
  const angular = new Vector3(
    getRandomInt(actor.mass * ROLL_ANGULAR_IMPULSE_MIN, actor.mass * ROLL_ANGULAR_IMPULSE_MAX),
    getRandomInt(actor.mass * ROLL_ANGULAR_IMPULSE_MIN, actor.mass * ROLL_ANGULAR_IMPULSE_MAX),
    getRandomInt(actor.mass * ROLL_ANGULAR_IMPULSE_MIN, actor.mass * ROLL_ANGULAR_IMPULSE_MAX),
  );

  actor.body.setLinearVelocity(Vector3.Zero());
  pick(actor, '', 0.5);
  setTimeout(() => {
    release(actor);
    setTimeout(() => {
      actor.body.applyImpulse(new Vector3(0, impulse, 0), actor.body.getObjectCenterWorld());
      actor.body.applyAngularImpulse(angular);
    }, 50);
  }, 50);
}
