import { authMockAdmin } from '../../test/authMock';
import { CaslAbilityFactory } from './casl-ability.factory';

describe('CaslAbilityFactory', () => {
  const user = {
    ...authMockAdmin,
    Role: {
      Permissions: [
        {
          action: 'read',
          subject: 'Game',
        },
        {
          action: 'create',
          subject: 'Game',
        },
        {
          action: 'update',
          subject: 'Game',
        },
        {
          action: 'delete',
          subject: 'Game',
          conditions: { authorId: '{{ userId }}' },
        },
        {
          action: 'read',
          subject: 'User',
        },
        {
          action: 'update',
          subject: 'User',
        },
        {
          action: 'delete',
          subject: 'User',
          conditions: { authorId: '{{ userId }}' },
        },
      ],
    },
  };

  it('should be defined', () => {
    expect(new CaslAbilityFactory()?.createForUser(user)).toBeDefined();
  });

  it('should allow reading Game', () => {
    const ability = new CaslAbilityFactory().createForUser(user);
    expect(ability.can('read', 'Game')).toBeTruthy();
  });
});
