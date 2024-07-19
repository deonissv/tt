import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { ValidatedUser } from '../auth/validated-user';

export const User = createParamDecorator((_data: unknown, context: ExecutionContext): ValidatedUser => {
  const { user } = context.switchToHttp().getRequest<{ user: ValidatedUser }>();
  return user;
});
