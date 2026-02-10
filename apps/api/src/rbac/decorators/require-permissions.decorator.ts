import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from '../../common/constants';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Require ALL of the specified permissions
 * @example
 * @RequirePermissions(PERMISSIONS.EMPLOYEES_READ, PERMISSIONS.EMPLOYEES_EXPORT)
 * @Get()
 * findAll() {}
 */
export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
