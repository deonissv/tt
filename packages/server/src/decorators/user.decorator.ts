import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { ValidatedUser } from '../auth/validated-user';

/**
 * Decorator that retrieves the authenticated user from the request object.
 *
 * @param _data - Optional data passed to the decorator.
 * @param context - The execution context containing the request object.
 * @returns The validated user object extracted from the request.
 */
export const User = createParamDecorator((_data: unknown, context: ExecutionContext): ValidatedUser => {
  const { user } = context.switchToHttp().getRequest<{ user: ValidatedUser }>();
  return user;
});
