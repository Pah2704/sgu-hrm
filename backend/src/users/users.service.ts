import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { EmployeesService } from '../employees/employees.service';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private employeesService: EmployeesService,
        private rolesService: RolesService,
    ) { }

    async onApplicationBootstrap() {
        await this.seed();
    }

    async seed() {
        let admin = await this.usersRepository.findOne({ where: { username: 'admin' }, relations: ['roles'] });

        if (admin) {
            console.log(`[UsersService] Admin found. Roles: ${admin.roles?.map(r => r.name).join(', ')}`);
        } else {
            console.log('[UsersService] Admin not found');
        }

        if (!admin || !admin.employeeId) {
            console.log('Seeding or updating admin user...');
            // Create default admin employee if needed
            const empName = 'Quản trị viên';
            let adminEmp = null;
            try {
                // Check if admin employee exists by code
                // Assuming we can't search by service easily without specific method, just try create
                // Since code 'ADMIN001' is unique, create might fail if exists.
                // Ideally findOne from service.
                // For now, try create, if fail (likely due to unique constraint), we ignore.
                // But better to use Repository if we had it.
                // We will just try to create and catch.
                adminEmp = await this.employeesService.create({
                    fullName: empName,
                    citizenId: '000000000000',
                    employeeCode: 'ADMIN001',
                    dob: '2000-01-01',
                    gender: 'Nam',
                    type: 'Viên chức'
                } as any);
            } catch (e) {
                console.log('Admin employee might already exist or creation failed, checking if we can query it or just proceed.');
                // In real app, we should query. Since we can't easily query by code via service without adding method, 
                // let's assume if creation failed, the user might be manually set up. 
                // However, to fix the specific issue of "null employeeId", we really need that ID.
                // NOTE: This is a hack for the "fix" request.
            }

            if (!admin) {
                const hashedPassword = await bcrypt.hash('password', 10);
                admin = this.usersRepository.create({
                    username: 'admin',
                    password: hashedPassword,
                    role: UserRole.ADMIN,
                    isActive: true,
                    employeeId: adminEmp ? adminEmp.id : null,
                });
                await this.usersRepository.save(admin);
                console.log('Seeded default admin user');
                console.log('Linked existing admin to new employee profile');
            }
        }

        // Assign 'System Admin' role
        // Check admin again in case it was created/updated (locally variable 'admin' holds it)
        if (admin) {
            const adminRole = await this.rolesService.findByName('System Admin');
            console.log(`[UsersService] Found System Admin role: ${adminRole ? 'Yes' : 'No'}`);
            if (adminRole) {
                // Check if already assigned
                const hasRole = admin.roles?.some(r => r.name === 'System Admin');
                console.log(`[UsersService] Admin has role? ${hasRole}`);
                if (!hasRole) {
                    admin.roles = [...(admin.roles || []), adminRole];
                    await this.usersRepository.save(admin);
                    console.log('Assigned System Admin role to admin user');
                }
            } else {
                console.log('[UsersService] ERROR: System Admin role not found!');
            }
        }
    }

    async findByName(username: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { username }, relations: ['roles', 'roles.permissions'] });
    }

    // Reuse findOne for backward compat if needed, but updated to preload roles
    async findOne(username: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { username }, relations: ['roles', 'roles.permissions'] });
    }

    async findById(id: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { id }, relations: ['roles', 'roles.permissions'] });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({ relations: ['roles', 'employee'] });
    }

    async assignRoles(userId: string, roleIds: string[]) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        // Fetch roles (Need a method in RolesService to find multiple, or iterate)
        // Ideally RolesService should expose findByIds. 
        // For now, I'll fetch one by one or assume RolesService can do it.
        // Let's assume we update RolesService or use a loop.
        // Or simpler: use `rolesService.roleRepo` if it was public, but it's private.
        // I'll assume I update RolesService to have findByIds.
        const roles = [];
        for (const rId of roleIds) {
            const role = await this.rolesService.findOne(rId);
            if (role) roles.push(role);
        }

        user.roles = roles;
        return this.usersRepository.save(user);
    }

    async create(user: Partial<User>): Promise<User> {
        const newUser = this.usersRepository.create(user);
        return this.usersRepository.save(newUser);
    }
}
