import { RawRuleOf, MongoAbility, ForcedSubject, createMongoAbility, MongoQuery } from '@casl/ability';

import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

export const Actions = ['read', 'manage', 'create', 'update', 'delete'] as const;
export const Subjects = ['Game', 'User', 'all'] as const;

export type Abilities = [
  (typeof Actions)[number],
  (typeof Subjects)[number] | ForcedSubject<Exclude<(typeof Subjects)[number], 'all'>>,
];

export type AppAbility = MongoAbility<Abilities>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(
    user: User & { Role: { Permissions: { action: string; subject: string; conditions?: Prisma.JsonValue }[] } },
  ) {
    const rules = user.Role.Permissions.map(permission => {
      const rule: RawRuleOf<AppAbility> = {
        action: permission.action as (typeof Actions)[number],
        subject: permission.subject as (typeof Subjects)[number],
        conditions: permission.conditions
          ? (JSON.parse(
              JSON.stringify(permission.conditions).replace('"{{ userId }}"', user.userId.toString()),
            ) as MongoQuery)
          : undefined,
      };
      console.log(user.userId);
      console.log(rule.conditions);

      return rule;
    });

    return createMongoAbility<AppAbility>(rules);
  }
}
