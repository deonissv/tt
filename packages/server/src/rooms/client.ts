import type { ValidatedUser } from '../auth/validated-user';

export class Client {
  userId: number;
  username: string;
  code: string;
  roleId: number;

  pickHeight: number;
  rotationStep: number;

  constructor(user: ValidatedUser) {
    this.userId = user.userId;
    this.username = user.username;
    this.code = user.code;
    this.roleId = user.roleId;

    this.pickHeight = 1.5;
    this.rotationStep = Math.PI / 18;
  }
}
