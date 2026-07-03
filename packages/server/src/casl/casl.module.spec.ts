import { subject } from '@casl/ability';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { Game } from '@prisma/client';
import { authMockAdmin, authMockUser } from '../../test/authMock';
import { useDatabaseMock } from '../../test/useDatabaseMock';
import type { ValidatedUser } from '../auth/validated-user';
import { PermissionsService } from '../permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CaslModule } from './casl.module';

const gameOwnedBy = (authorId: number): Game => ({
  gameId: 1,
  code: 'code',
  name: 'name',
  description: 'description',
  bannerUrl: 'bannerUrl',
  authorId,
  createdAt: new Date(),
  deletedAt: null,
});

describe('CaslModule', () => {
  useDatabaseMock();

  let moduleRef: TestingModule;
  let permissionsService: PermissionsService;
  let caslAbilityFactory: CaslAbilityFactory;
  let prismaService: PrismaService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({ imports: [CaslModule] }).compile();
    permissionsService = moduleRef.get(PermissionsService);
    caslAbilityFactory = moduleRef.get(CaslAbilityFactory);
    prismaService = moduleRef.get(PrismaService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  const abilityFor = async (user: ValidatedUser) =>
    caslAbilityFactory.createForUser(await permissionsService.getUserWithPermissions(user));

  describe('PermissionsService', () => {
    it("resolves the permissions seeded for the user's role", async () => {
      const { Role } = await permissionsService.getUserWithPermissions(authMockUser); // roleId 2 (User)

      expect(Role.Permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ action: 'create', subject: 'Game' }),
          expect.objectContaining({ action: 'read', subject: 'Game' }),
          expect.objectContaining({
            action: 'update',
            subject: 'Game',
            conditions: { authorId: '${ userId }' },
          }),
        ]),
      );
    });

    it('caches permissions per role within the TTL instead of re-querying', async () => {
      const first = await permissionsService.getPermissionsByRoleId(authMockUser.roleId);
      expect(first.length).toBeGreaterThan(0);

      // Drop the rows: an uncached lookup would now come back empty.
      await prismaService.permission.deleteMany({
        where: { roleId: authMockUser.roleId },
      });
      const remaining = await prismaService.permission.findMany({
        where: { roleId: authMockUser.roleId },
      });
      expect(remaining).toHaveLength(0);

      const second = await permissionsService.getPermissionsByRoleId(authMockUser.roleId);
      expect(second).toEqual(first);
    });

    it('picks up a DB permission change once the TTL expires, without a restart', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      try {
        const first = await permissionsService.getPermissionsByRoleId(authMockUser.roleId);
        expect(first.length).toBeGreaterThan(0);

        await prismaService.permission.deleteMany({
          where: { roleId: authMockUser.roleId },
        });

        // Still inside the TTL: the stale value is served.
        expect(await permissionsService.getPermissionsByRoleId(authMockUser.roleId)).toEqual(first);

        // Jump well past any reasonable cache TTL.
        vi.setSystemTime(Date.now() + 60 * 60 * 1000);

        expect(await permissionsService.getPermissionsByRoleId(authMockUser.roleId)).toHaveLength(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('re-queries immediately after explicit invalidation', async () => {
      const first = await permissionsService.getPermissionsByRoleId(authMockUser.roleId);
      expect(first.length).toBeGreaterThan(0);

      await prismaService.permission.deleteMany({
        where: { roleId: authMockUser.roleId },
      });
      permissionsService.invalidate(authMockUser.roleId);

      expect(await permissionsService.getPermissionsByRoleId(authMockUser.roleId)).toHaveLength(0);
    });
  });

  describe('ability resolved through the module', () => {
    it('grants the admin role full access', async () => {
      const ability = await abilityFor(authMockAdmin); // roleId 1 -> manage all

      expect(ability.can('manage', 'all')).toBe(true);
      expect(ability.can('delete', 'Game')).toBe(true);
    });

    it('applies the seeded owner condition: a user manages only their own games', async () => {
      const ability = await abilityFor(authMockUser); // userId 1, roleId 2

      expect(ability.can('update', subject('Game', gameOwnedBy(authMockUser.userId)))).toBe(true);
      expect(ability.can('update', subject('Game', gameOwnedBy(authMockAdmin.userId)))).toBe(false);
    });

    it('restricts the guest role to reading', async () => {
      const guest: ValidatedUser = { ...authMockUser, roleId: 3 };
      const ability = await abilityFor(guest);

      expect(ability.can('read', 'Game')).toBe(true);
      expect(ability.can('create', 'Game')).toBe(false);
      expect(ability.can('update', subject('Game', gameOwnedBy(guest.userId)))).toBe(false);
    });
  });
});
