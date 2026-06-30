import type { ForcedSubject, MongoAbility, MongoQuery, RawRuleOf } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';

import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { ValidatedUser } from '../auth/validated-user';
import { PermissionsService } from '../permissions.service';

export const Actions = ['read', 'manage', 'create', 'update', 'delete'] as const;
export const Subjects = ['Game', 'User', 'Room', 'all'] as const;

export type Action = (typeof Actions)[number];
export type Subject = (typeof Subjects)[number];

export type Abilities = [Action, Subject | ForcedSubject<Exclude<Subject, 'all'>>];

export type AppAbility = MongoAbility<Abilities>;
export type UserWithPermissions = ValidatedUser & {
  Role: { Permissions: { action: string; subject: string; conditions?: Prisma.JsonValue }[] };
};

@Injectable()
export class CaslAbilityFactory {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Loads the permissions for a request-scoped user and builds their ability.
   *
   * @param user - The authenticated (JWT-validated) user.
   * @returns The ability object for the user.
   */
  async createForRequestUser(user: ValidatedUser): Promise<AppAbility> {
    const userWithPermissions = await this.permissionsService.getUserWithPermissions(user);
    return this.createForUser(userWithPermissions);
  }

  /**
   * Creates an ability object for the specified user.
   *
   * @param user - The user object with permissions.
   * @returns The ability object for the user.
   */
  createForUser(user: UserWithPermissions) {
    const rules = user.Role.Permissions.map(permission => {
      const rule: RawRuleOf<AppAbility> = {
        action: permission.action as Action,
        subject: permission.subject as Subject,
        conditions: permission.conditions
          ? (JSON.parse(
              JSON.stringify(permission.conditions).replace('"${ userId }"', user.userId.toString()),
            ) as MongoQuery)
          : undefined,
      };

      return rule;
    });

    return createMongoAbility<AppAbility>(rules);
  }
}
