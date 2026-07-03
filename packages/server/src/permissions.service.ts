import { Injectable } from '@nestjs/common';
import type { Permission } from '@prisma/client';
import type { ValidatedUser } from './auth/validated-user';
import type { UserWithPermissions } from './casl/casl-ability.factory';
import { PrismaService } from './prisma/prisma.service';

const PERMISSIONS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  permissions: Permission[];
  expiresAt: number;
}

@Injectable()
export class PermissionsService {
  private readonly cache = new Map<number, CacheEntry>();

  constructor(private readonly prismaService: PrismaService) {}

  async getPermissionsByRoleId(roleId: number): Promise<Permission[]> {
    const cached = this.cache.get(roleId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.permissions;
    }

    const permissions = await this.prismaService.permission.findMany({
      where: {
        roleId: roleId,
      },
    });
    this.cache.set(roleId, {
      permissions,
      expiresAt: Date.now() + PERMISSIONS_CACHE_TTL_MS,
    });
    return permissions;
  }

  /** Drops cached permissions for one role, or all roles when no id is given.
   *  Must be called by any future endpoint that mutates roles/permissions. */
  invalidate(roleId?: number): void {
    if (roleId === undefined) {
      this.cache.clear();
    } else {
      this.cache.delete(roleId);
    }
  }

  async getUserWithPermissions(user: ValidatedUser): Promise<UserWithPermissions> {
    const permissions = await this.getPermissionsByRoleId(user.roleId);
    return {
      ...user,
      Role: {
        Permissions: permissions,
      },
    };
  }
}
