import { Injectable } from '@nestjs/common';
import type { Permission } from '@prisma/client';
import type { ValidatedUser } from './auth/validated-user';
import type { UserWithPermissions } from './casl/casl-ability.factory';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class PermissionsService {
  permissions = new Map<number, Permission[]>();
  prismaService: PrismaService;

  constructor() {
    this.prismaService = new PrismaService();
  }

  async getPermissionsByRoleId(roleId: number): Promise<Permission[]> {
    let permissions = this.permissions.get(roleId);
    if (!permissions) {
      permissions = await this.prismaService.permission.findMany({
        where: {
          roleId: roleId,
        },
      });
      this.permissions.set(roleId, permissions);
    }
    return permissions;
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
