import { Test, TestingModule } from '@nestjs/testing';
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed'),
    compare: jest.fn().mockResolvedValue(true),
}));
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { EmployeesService } from '../employees/employees.service';
import { Repository } from 'typeorm';

const mockUser = {
    id: 'user-1',
    username: 'testuser',
    roles: [],
};

const mockRole = {
    id: 'role-1',
    name: 'Admin',
};

const mockUserRepository = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn().mockResolvedValue([mockUser]),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
};

const mockRolesService = {
    findOne: jest.fn().mockResolvedValue(mockRole),
    findByName: jest.fn().mockResolvedValue(mockRole),
};

const mockEmployeesService = {
    create: jest.fn(),
};

describe('UsersService', () => {
    let service: UsersService;
    let userRepo: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: RolesService,
                    useValue: mockRolesService,
                },
                {
                    provide: EmployeesService,
                    useValue: mockEmployeesService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findByName', () => {
        it('should return a user with roles', async () => {
            await service.findByName('testuser');
            expect(userRepo.findOne).toHaveBeenCalledWith({
                where: { username: 'testuser' },
                relations: ['roles', 'roles.permissions'],
            });
        });
    });

    describe('assignRoles', () => {
        it('should assign roles to user', async () => {
            const saveSpy = jest.spyOn(userRepo, 'save');

            await service.assignRoles('user-1', ['role-1']);

            expect(mockRolesService.findOne).toHaveBeenCalledWith('role-1');
            expect(mockUser.roles).toContain(mockRole);
            expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
                id: 'user-1',
                roles: expect.arrayContaining([mockRole]),
            }));
        });
    });
});
