import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
    private readonly logger = new Logger(PermissionsGuard.name);

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        this.logger.log(`Checking permissions for user: ${user?.username}`);

        if (!user || !user.roles) {
            this.logger.warn(`User ${user?.username} has no roles attached or not logged in`);
            this.logger.warn(`User object keys: ${Object.keys(user || {})}`);
            if (user) this.logger.warn(`User roles: ${JSON.stringify(user.roles)}`);
            return false;
        }

        // Check if user has ANY of the required permissions (OR logic usually, or AND?)
        // Usually @RequirePermission('A', 'B') means A OR B? Or A AND B?
        // Let's assume OR for now, or strict AND.
        // For simplicity, let's assume one required permission usually.
        // If multiple are passed, we might require ALL.
        // Let's implement check: Does user have permission X?

        // Flatten user permissions
        const userPermissions = new Set<string>();
        // Check for Super Admin (optional bypass)
        // const isSuperAdmin = user.roles.some(r => r.isSystem && r.name === 'System Admin');
        // if (isSuperAdmin) return true; 

        user.roles.forEach(role => {
            role.permissions.forEach(p => userPermissions.add(p.action));
        });

        // Debug
        // this.logger.debug(`User Permissions: ${Array.from(userPermissions).join(', ')}`);
        // this.logger.debug(`Required: ${requiredPermissions.join(', ')}`);

        const hasPermission = requiredPermissions.some(permission => userPermissions.has(permission));
        if (!hasPermission) {
            this.logger.warn(`User ${user.username} missing required permissions: ${requiredPermissions.join(', ')}`);
            this.logger.warn(`User has permissions: ${Array.from(userPermissions).join(', ')}`);
        }
        return hasPermission;
    }
}
