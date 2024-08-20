import { Vector3, type Mesh } from '@babylonjs/core';
import { ActorMapper, type DieNState, type DieType } from '@shared/dto/states';
import { DieMixin } from '@shared/playground/actors/DieMixin';
import type { Constructor } from '@shared/types';
import { getRandomInt } from '@shared/utils';
import { ServerBase } from './serverBase';

const ROLL_IMPULSE_MIX = 35;
const ROLL_IMPULSE_MAX = 60;

const ROLL_ANGULAR_IMPULSE_MIX = 5;
const ROLL_ANGULAR_IMPULSE_MAX = 7;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class ServerDie<T extends DieType> extends ServerBase<DieNState<T>> {
  numFaces: number;

  constructor(state: DieNState<T>, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(state, modelMesh, colliderMesh);

    this.numFaces = ActorMapper[state.type];
  }

  roll() {
    const impulse = this.mass * getRandomInt(ROLL_IMPULSE_MIX, ROLL_IMPULSE_MAX);
    const imluseAngularX = getRandomInt(this.mass * ROLL_ANGULAR_IMPULSE_MIX, this.mass * ROLL_ANGULAR_IMPULSE_MAX);
    const imluseAngularY = getRandomInt(this.mass * ROLL_ANGULAR_IMPULSE_MIX, this.mass * ROLL_ANGULAR_IMPULSE_MAX);
    const imluseAngularZ = getRandomInt(this.mass * ROLL_ANGULAR_IMPULSE_MIX, this.mass * ROLL_ANGULAR_IMPULSE_MAX);

    this.body.setLinearVelocity(new Vector3(0, 0, 0));

    this.body.applyImpulse(new Vector3(0, impulse, 0), this.body.getObjectCenterWorld());
    this.body.applyAngularImpulse(new Vector3(imluseAngularX, imluseAngularY, imluseAngularZ));
  }
}

export class Die4 extends DieMixin<Constructor<ServerDie<4>>, 4>(ServerDie) {}
export class Die6 extends DieMixin<Constructor<ServerDie<6>>, 6>(ServerDie) {}
export class Die8 extends DieMixin<Constructor<ServerDie<8>>, 8>(ServerDie) {}

export class Die10 extends DieMixin<Constructor<ServerDie<10>>, 10>(ServerDie) {}
export class Die12 extends DieMixin<Constructor<ServerDie<12>>, 12>(ServerDie) {}
export class Die20 extends DieMixin<Constructor<ServerDie<20>>, 20>(ServerDie) {}
