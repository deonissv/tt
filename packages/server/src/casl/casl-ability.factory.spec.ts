import { subject } from '@casl/ability';
import { permissions } from '../../prisma/seed';
import { authMockAdmin } from '../../test/authMock';
import { CaslAbilityFactory, UserWithPermissions } from './casl-ability.factory';
import { Game } from '@prisma/client';

const userFactory = (roleId: number): UserWithPermissions => {
  return {
    ...authMockAdmin,
    Role: {
      Permissions: permissions.filter(p => p.roleId === roleId),
    },
  };
};

describe('CaslAbilityFactory', () => {
  const admin = userFactory(1);
  const user = userFactory(2);
  const guest = userFactory(3);

  describe('should be defined', () => {
    it('for admin', () => {
      expect(new CaslAbilityFactory()?.createForUser(admin)).toBeDefined();
    });

    it('for user', () => {
      expect(new CaslAbilityFactory()?.createForUser(user)).toBeDefined();
    });
  });

  describe('Games resource', () => {
    describe('Admin role', () => {
      it('should allow managing Game', () => {
        const ability = new CaslAbilityFactory().createForUser(admin);
        expect(ability.can('manage', 'Game')).toBeTruthy();
      });
    });

    describe('User role', () => {
      it('should allow creating Game', () => {
        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('create', 'Game')).toBeTruthy();
      });

      it('should allow reading Game', () => {
        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('read', 'Game')).toBeTruthy();
      });

      it('should allow updating own Game', () => {
        const game: Game = {
          gameId: 1,
          code: 'code',
          name: 'name',
          description: 'description',
          bannerUrl: 'bannerUrl',
          authorId: user.userId,
          createdAt: new Date(),
          deletedAt: new Date(),
        };

        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('update', subject('Game', game))).toBeTruthy();
      });

      it('should allow deleting own Game', () => {
        const game: Game = {
          gameId: 1,
          code: 'code',
          name: 'name',
          description: 'description',
          bannerUrl: 'bannerUrl',
          authorId: user.userId,
          createdAt: new Date(),
          deletedAt: new Date(),
        };

        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('delete', subject('Game', game))).toBeTruthy();
      });

      it('should forbid updating not owning Game ', () => {
        const game: Game = {
          gameId: 1,
          code: 'code',
          name: 'name',
          description: 'description',
          bannerUrl: 'bannerUrl',
          authorId: ++user.userId,
          createdAt: new Date(),
          deletedAt: new Date(),
        };

        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('update', subject('Game', game))).toBeTruthy();
      });

      it('should forbid deleting not owning Game ', () => {
        const game: Game = {
          gameId: 1,
          code: 'code',
          name: 'name',
          description: 'description',
          bannerUrl: 'bannerUrl',
          authorId: ++user.userId,
          createdAt: new Date(),
          deletedAt: new Date(),
        };

        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('delete', subject('Game', game))).toBeTruthy();
      });
    });

    describe('Guest role', () => {
      it('should allow reading Game', () => {
        const ability = new CaslAbilityFactory().createForUser(guest);
        expect(ability.can('read', 'Game')).toBeTruthy();
      });
    });
  });

  describe('Users resource', () => {
    describe('Admin role', () => {
      it('should allow managing User', () => {
        const ability = new CaslAbilityFactory().createForUser(admin);
        expect(ability.can('manage', 'User')).toBeTruthy();
      });
    });

    describe('User role', () => {
      it('should allow creating User', () => {
        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('create', 'User')).toBeTruthy();
      });
      it('should allow reading User', () => {
        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('read', 'User')).toBeTruthy();
      });
      it('should allow updating self', () => {
        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('update', subject('User', user))).toBeTruthy();
      });
      it('should allow deleting self', () => {
        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('delete', subject('User', user))).toBeTruthy();
      });
    });

    describe('Guest role', () => {
      it('should allow reading User', () => {
        const ability = new CaslAbilityFactory().createForUser(guest);
        expect(ability.can('read', 'User')).toBeTruthy();
      });
    });
  });

  describe('Rooms resource', () => {
    describe('Admin role', () => {
      it('should allow managing Room', () => {
        const ability = new CaslAbilityFactory().createForUser(admin);
        expect(ability.can('manage', 'Room')).toBeTruthy();
      });
    });

    describe('User role', () => {
      it('should allow creating Room', () => {
        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('create', 'Room')).toBeTruthy();
      });
      it('should allow reading Room', () => {
        const ability = new CaslAbilityFactory().createForUser(user);
        expect(ability.can('read', 'Room')).toBeTruthy();
      });
    });

    describe('Guest role', () => {
      it('should allow reading Room', () => {
        const ability = new CaslAbilityFactory().createForUser(guest);
        expect(ability.can('read', 'Room')).toBeTruthy();
      });
    });
  });
});
