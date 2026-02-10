import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CurrentUserPayload } from '../../auth/interfaces';

/**
 * Extract current user from request (attached by JwtAuthGuard)
 * @example
 * // Get full user
 * getProfile(@CurrentUser() user: CurrentUserPayload) {}
 *
 * // Get specific field
 * update(@CurrentUser('userId') userId: string) {}
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: CurrentUserPayload }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
