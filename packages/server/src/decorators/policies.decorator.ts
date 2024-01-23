import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { AppAbility, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PrismaService } from '../prisma.service';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) => SetMetadata(CHECK_POLICIES, handlers);

export interface RequiredRule {
  action: string;
  subject: string;
  conditions?: any;
}

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES, context.getHandler()) || [];

    const { user: currentUser } = context.switchToHttp().getRequest<{ user: User }>();

    if (!currentUser) {
      return false;
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        userId: currentUser.userId,
      },
      include: {
        Role: {
          include: {
            Permissions: true,
          },
        },
      },
    });

    const ability = this.caslAbilityFactory.createForUser(user);
    return policyHandlers.every(handler => this.execPolicyHandler(handler, ability));
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
