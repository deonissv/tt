import type { MsgMap, ServerActionMsg } from '@tt/actions';
import { ServerAction } from '@tt/actions';
import type { ValidatedUser } from '../auth/validated-user';
import { Client } from './client';

const user: ValidatedUser = {
  userId: 1,
  username: 'alice',
  code: 'alice-code',
  roleId: 2,
};

const cursorsAction = (payload: MsgMap[ServerAction.CURSORS]['payload']): MsgMap[ServerAction.CURSORS] => ({
  type: ServerAction.CURSORS,
  payload,
});

const removeAction: ServerActionMsg = {
  type: ServerAction.REMOVE_ACTOR,
  payload: 'box',
};

describe('Client', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client(user);
  });

  describe('constructor', () => {
    it('copies the identity fields from the validated user', () => {
      expect(client.userId).toBe(user.userId);
      expect(client.username).toBe(user.username);
      expect(client.code).toBe(user.code);
      expect(client.roleId).toBe(user.roleId);
    });

    it('initializes pick height and rotation step to defaults', () => {
      expect(client.pickHeight).toBe(1.5);
      expect(client.rotationStep).toBe(Math.PI / 18);
    });
  });

  describe('prepareMessage', () => {
    it('returns an empty array when there is nothing to send', () => {
      expect(client.prepareMessage(null, [])).toEqual([]);
    });

    it('returns sim actions as-is when there is no cursors action', () => {
      const actions = client.prepareMessage(null, [removeAction]);

      expect(actions).toEqual([removeAction]);
    });

    it('places the cursors action before the sim actions', () => {
      const actions = client.prepareMessage(cursorsAction({ other: [1, 2] }), [removeAction]);

      expect(actions.map(action => action.type)).toEqual([ServerAction.CURSORS, ServerAction.REMOVE_ACTOR]);
    });

    it("removes the client's own cursor from the cursors action", () => {
      const actions = client.prepareMessage(cursorsAction({ [user.code]: [1, 2], other: [3, 4] }), []);

      expect(actions).toEqual([cursorsAction({ other: [3, 4] })]);
    });

    it('keeps the cursors payload intact when it does not contain the client cursor', () => {
      const actions = client.prepareMessage(cursorsAction({ other1: [1, 2], other2: [3, 4] }), []);

      expect(actions).toEqual([cursorsAction({ other1: [1, 2], other2: [3, 4] })]);
    });

    it('does not mutate the original cursors action', () => {
      const original = cursorsAction({ [user.code]: [1, 2], other: [3, 4] });

      client.prepareMessage(original, [removeAction]);

      expect(original.payload).toEqual({ [user.code]: [1, 2], other: [3, 4] });
    });
  });
});
