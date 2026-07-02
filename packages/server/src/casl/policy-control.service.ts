import { ForbiddenException, Injectable } from '@nestjs/common';
import { subject } from '@casl/ability';

import type { ValidatedUser } from '../auth/validated-user';
import { CaslAbilityFactory } from './casl-ability.factory';
import type { Action, Subject } from './casl-ability.factory';

/**
 * Performs instance-level authorization in the service layer, next to the data
 * it guards.
 */
@Injectable()
export class PolicyControlService {
  constructor(private readonly caslAbilityFactory: CaslAbilityFactory) {}

  async authorize(
    user: ValidatedUser,
    action: Action,
    subjectName: Exclude<Subject, 'all'>,
    resource: object,
  ): Promise<void> {
    const ability = await this.caslAbilityFactory.createForRequestUser(user);
    if (!ability.can(action, subject(subjectName, resource as Record<PropertyKey, unknown>))) {
      throw new ForbiddenException(`Cannot ${action} the ${subjectName.toLowerCase()}`);
    }
  }
}
