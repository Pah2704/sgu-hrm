import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RolesService implements OnModuleInit {
    private readonly logger = new Logger(RolesService.name);

    constructor(
        @InjectRepository(Role)
        private roleRepo: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepo: Repository<Permission>,
    ) { }

    findAllPermissions() {
        return this.permissionRepo.find();
    }

    async onModuleInit() {
        await this.seedPermissions();
        await this.seedDefaultRoles();
    }

    private async seedPermissions() {
        const permissions = [
            // Employee
            'employee:view', 'employee:create', 'employee:edit', 'employee:delete',
            // Contract
            'contract:view', 'contract:create', 'contract:edit', 'contract:delete',
            // Salary
            'salary:view', 'salary:edit',
            // Training
            'training:view', 'training:create', 'training:edit', 'training:delete',
            // Reward Discipline
            'reward-discipline:view', 'reward-discipline:create', 'reward-discipline:edit', 'reward-discipline:delete',
            // Work History
            'work-history:view', 'work-history:create', 'work-history:edit', 'work-history:delete',
            // Family
            'family:view', 'family:create', 'family:edit', 'family:delete',
            // Unit
            'unit:view', 'unit:create', 'unit:edit', 'unit:delete',
            // User & Role (Admin)
            'user:view', 'user:create', 'user:edit', 'user:delete',
            'role:view', 'role:create', 'role:edit', 'role:delete',
            // System
            'audit-log:view', 'report:view',
        ];

        for (const action of permissions) {
            const exists = await this.permissionRepo.findOne({ where: { action } });
            if (!exists) {
                await this.permissionRepo.save({ action, description: `Permission for ${action}` });
            }
        }
        this.logger.log('Permissions seeded');
    }

    private async seedDefaultRoles() {
        const defaultRoles = [
            {
                name: 'System Admin',
                description: 'Full system access',
                isSystem: true,
                permissions: ['*'] // Logic to fetch all
            },
            {
                name: 'HR Manager',
                description: 'Manage Personnel, Contracts, etc.',
                isSystem: true,
                permissions: [
                    'employee:view', 'employee:create', 'employee:edit', 'employee:delete',
                    'contract:view', 'contract:create', 'contract:edit', 'contract:delete',
                    'salary:view', 'salary:edit',
                    'training:view', 'training:create', 'training:edit', 'training:delete',
                    'reward-discipline:view', 'reward-discipline:create', 'reward-discipline:edit', 'reward-discipline:delete',
                    'work-history:view', 'work-history:create', 'work-history:edit', 'work-history:delete',
                    'family:view', 'family:create', 'family:edit', 'family:delete',
                    'unit:view', 'unit:create', 'unit:edit', 'unit:delete',
                    'user:view', // HR can view users but not create admins
                    'report:view'
                ]
            },
            {
                name: 'Employee',
                description: 'Regular user',
                isSystem: true,
                permissions: ['employee:view'] // Self view only (handled by logic usually)
            }
        ];

        for (const roleData of defaultRoles) {
            const roleExists = await this.roleRepo.findOne({ where: { name: roleData.name } });
            if (!roleExists) {
                let permissions: Permission[] = [];
                if (roleData.permissions.includes('*')) {
                    permissions = await this.permissionRepo.find();
                } else {
                    permissions = await this.permissionRepo.find({
                        where: { action: In(roleData.permissions) }
                    });
                }

                await this.roleRepo.save({
                    name: roleData.name,
                    description: roleData.description,
                    isSystem: roleData.isSystem,
                    permissions: permissions
                });
            }
        }
        this.logger.log('Default Roles seeded');
    }

    // CRUD Methods
    async create(createRoleDto: any) {
        const role = this.roleRepo.create(createRoleDto) as unknown as Role;
        if (createRoleDto.permissionIds) {
            role.permissions = await this.permissionRepo.findBy({ id: In(createRoleDto.permissionIds) });
        }
        return this.roleRepo.save(role);
    }

    findAll() {
        return this.roleRepo.find({ relations: ['permissions'] });
    }

    findByName(name: string) {
        return this.roleRepo.findOne({ where: { name }, relations: ['permissions'] });
    }

    findOne(id: string) {
        return this.roleRepo.findOne({ where: { id }, relations: ['permissions'] });
    }

    async update(id: string, updateRoleDto: any) {
        // Expects permissionIds in DTO
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) throw new Error('Role not found');
        Object.assign(role, updateRoleDto);
        if (updateRoleDto.permissionIds) {
            role.permissions = await this.permissionRepo.findBy({ id: In(updateRoleDto.permissionIds) });
        }
        return this.roleRepo.save(role);
    }

    remove(id: string) {
        return this.roleRepo.delete(id);
    }
}
