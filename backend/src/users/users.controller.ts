import { Controller, Get, Post, Body, Patch, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @RequirePermission('user:view')
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':username')
    @RequirePermission('user:view')
    findOne(@Param('username') username: string) {
        return this.usersService.findOne(username);
    }

    @Post()
    @RequirePermission('user:create')
    async create(@Body() createUserDto: any) {
        // Only Admin should create users
        return this.usersService.create(createUserDto);
    }

    @Post(':id/assign-roles')
    @RequirePermission('user:edit')
    assignRoles(@Param('id') userId: string, @Body() body: { roleIds: string[] }) {
        return this.usersService.assignRoles(userId, body.roleIds);
    }
}
