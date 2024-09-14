import type { ValidatedUser } from '../auth/validated-user';

export class Client {
  userId: number;
  username: string;
  code: string;
  roleId: number;

  constructor(user: ValidatedUser) {
    this.userId = user.userId;
    this.username = user.username;
    this.code = user.code;
    this.roleId = user.roleId;
  }
}
