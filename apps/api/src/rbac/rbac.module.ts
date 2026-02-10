import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacGuard } from './guards/rbac.guard';

/**
 * RBAC Module
 * Provides global guards for authentication and authorization
 *
 * Guard order: JwtAuthGuard → RbacGuard → Controller
 */
@Module({
  providers: [
    // Global JWT authentication
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global RBAC authorization
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
  ],
  exports: [],
})
export class RbacModule {}
