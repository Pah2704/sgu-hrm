import { SetMetadata } from '@nestjs/common';
import type { RoleName } from '../../common/constants';

export const ROLES_KEY = 'roles';

/**
 * Require ANY of the specified roles
 * @example
 * @Roles('HR_ADMIN', 'SUPER_ADMIN')
 * @Patch(':id')
 * update() {}
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
