import type { MsgMap, ServerAction, ServerActionMsg } from '@tt/actions';
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

  /**
   * Builds the message this client should receive for a tick, ready to be sent.
   * Returns an empty array when there is nothing to send.
   */
  prepareMessage(cursorsAction: MsgMap[ServerAction.CURSORS] | null, simActions: ServerActionMsg[]): ServerActionMsg[] {
    const actions: ServerActionMsg[] = [];
    if (cursorsAction && Object.keys(cursorsAction).length > 1) {
      actions.push(this.cleanUpCursors(cursorsAction));
    }
    actions.push(...simActions);
    return actions;
  }

  /**
   * Returns a copy of the cursors action with this client's own cursor removed,
   * so a user is not sent their own cursor position.
   */
  private cleanUpCursors(cursorsAction: MsgMap[ServerAction.CURSORS]): MsgMap[ServerAction.CURSORS] {
    const clientCursors = structuredClone(cursorsAction);
    delete clientCursors.payload[this.code];
    return clientCursors;
  }
}
