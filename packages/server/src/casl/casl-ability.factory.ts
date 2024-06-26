import type { RawRuleOf, MongoAbility, ForcedSubject, MongoQuery } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';

import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { ValidatedUser } from '../auth/validated-user';

export const Actions = ['read', 'manage', 'create', 'update', 'delete'] as const;
export const Subjects = ['Game', 'User', 'Room', 'all'] as const;

export type Abilities = [
  (typeof Actions)[number],
  (typeof Subjects)[number] | ForcedSubject<Exclude<(typeof Subjects)[number], 'all'>>,
];

export type AppAbility = MongoAbility<Abilities>;
export type UserWithPermissions = ValidatedUser & {
  Role: { Permissions: { action: string; subject: string; conditions?: Prisma.JsonValue }[] };
};

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserWithPermissions) {
    const rules = user.Role.Permissions.map(permission => {
      const rule: RawRuleOf<AppAbility> = {
        action: permission.action as (typeof Actions)[number],
        subject: permission.subject as (typeof Subjects)[number],
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
