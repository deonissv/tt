import type { Mock } from 'vitest';
import type { Permission } from '@prisma/client';

import type { PrismaService } from './prisma/prisma.service';
import type { ValidatedUser } from './auth/validated-user';
import { PermissionsService } from './permissions.service';

const permission = (permissionId: number, roleId = 2): Permission => ({
  permissionId,
  roleId,
  action: 'read',
  subject: 'Game',
  inverted: false,
  conditions: null,
  reason: null,
  createdAt: new Date(0),
  deletedAt: null,
});

const user = (roleId: number): ValidatedUser => ({
  userId: 1,
  username: 'alice',
  code: 'alice-code',
  roleId,
});

const makeService = (findMany: Mock) =>
  new PermissionsService({ permission: { findMany } } as unknown as PrismaService);

describe('PermissionsService', () => {
  let findMany: Mock;
  let service: PermissionsService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    findMany = vi.fn().mockResolvedValue([permission(1)]);
    service = makeService(findMany);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getPermissionsByRoleId', () => {
    it('queries the database for the role on first access', async () => {
      await expect(service.getPermissionsByRoleId(2)).resolves.toEqual([permission(1)]);

      expect(findMany).toHaveBeenCalledTimes(1);
      expect(findMany).toHaveBeenCalledWith({ where: { roleId: 2 } });
    });

    it('serves repeated reads from the cache within the TTL', async () => {
      await service.getPermissionsByRoleId(2);
      vi.advanceTimersByTime(4 * 60 * 1000);

      await expect(service.getPermissionsByRoleId(2)).resolves.toEqual([permission(1)]);

      expect(findMany).toHaveBeenCalledTimes(1);
    });

    it('re-queries once the cache entry reaches its TTL', async () => {
      await service.getPermissionsByRoleId(2);
      vi.advanceTimersByTime(5 * 60 * 1000);

      await service.getPermissionsByRoleId(2);

      expect(findMany).toHaveBeenCalledTimes(2);
    });

    it('caches roles independently', async () => {
      findMany.mockImplementation(({ where: { roleId } }: { where: { roleId: number } }) =>
        Promise.resolve([permission(roleId)]),
      );

      await service.getPermissionsByRoleId(2);
      await service.getPermissionsByRoleId(3);

      expect(findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('invalidate', () => {
    beforeEach(async () => {
      await service.getPermissionsByRoleId(2);
      await service.getPermissionsByRoleId(3);
      findMany.mockClear();
    });

    it('drops only the given role', async () => {
      service.invalidate(2);

      await service.getPermissionsByRoleId(2);
      await service.getPermissionsByRoleId(3);

      expect(findMany).toHaveBeenCalledTimes(1);
      expect(findMany).toHaveBeenCalledWith({ where: { roleId: 2 } });
    });

    it('drops every role when called without an id', async () => {
      service.invalidate();

      await service.getPermissionsByRoleId(2);
      await service.getPermissionsByRoleId(3);

      expect(findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserWithPermissions', () => {
    it('attaches the cached role permissions to the user', async () => {
      const result = await service.getUserWithPermissions(user(2));

      expect(result.userId).toBe(1);
      expect(result.roleId).toBe(2);
      expect(result.Role.Permissions).toEqual([permission(1)]);
    });
  });
});
