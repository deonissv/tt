import type { MsgMap, ServerActionMsg } from '@tt/actions';
import { ServerAction } from '@tt/actions';
import { ActorType } from '@tt/states';
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

    it('ignores a malformed cursors message without a payload', () => {
      const malformed = { type: ServerAction.CURSORS } as MsgMap[ServerAction.CURSORS];

      expect(client.prepareMessage(malformed, [removeAction])).toEqual([removeAction]);
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

  describe('hidden card faces', () => {
    const faceDownCard = (): MsgMap[ServerAction.SPAWN_ACTOR]['payload'] => ({
      type: ActorType.CARD,
      guid: 'card',
      name: 'Card',
      faceURL: 'face.png',
      backURL: 'back.png',
      cols: 1,
      rows: 1,
      sequence: 0,
      transformation: { rotation: [Math.PI, 0, 0] },
    });

    it('redacts the face of a face-down card spawned unheld', () => {
      const [action] = client.prepareMessage(null, [{ type: ServerAction.SPAWN_ACTOR, payload: faceDownCard() }]);

      expect(action).toMatchObject({
        type: ServerAction.SPAWN_ACTOR,
        payload: { faceURL: 'back.png', backURL: 'back.png' },
      });
    });

    it('redacts the face of a face-down card another client drew', () => {
      const [action] = client.prepareMessage(null, [
        { type: ServerAction.SPAWN_PICKED_ACTOR, payload: { clientId: 'someone-else', state: faceDownCard() } },
      ]);

      expect(action).toMatchObject({
        type: ServerAction.SPAWN_PICKED_ACTOR,
        payload: { state: { faceURL: 'back.png' } },
      });
    });

    it('keeps the full state for the client that holds the drawn card', () => {
      const held = client.prepareMessage(null, [
        { type: ServerAction.SPAWN_PICKED_ACTOR, payload: { clientId: user.code, state: faceDownCard() } },
      ]);

      expect(held[0]).toMatchObject({ payload: { state: { faceURL: 'face.png' } } });
    });

    it('leaves face-up cards untouched', () => {
      const faceUp = faceDownCard();
      faceUp.transformation = { rotation: [0, 0, 0] };

      const [action] = client.prepareMessage(null, [{ type: ServerAction.SPAWN_ACTOR, payload: faceUp }]);

      expect(action).toMatchObject({ payload: { faceURL: 'face.png' } });
    });
  });
});
