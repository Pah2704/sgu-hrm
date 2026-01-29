import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';

const mockRole = {
    id: 'role-1',
    name: 'Test Role',
    description: 'Test Description',
    permissions: [],
    isSystem: false,
};

const mockRoleRepository = {
    find: jest.fn().mockResolvedValue([mockRole]),
    findOne: jest.fn().mockResolvedValue(mockRole),
    create: jest.fn().mockReturnValue(mockRole),
    save: jest.fn().mockResolvedValue(mockRole),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockPermissionRepository = {
    find: jest.fn().mockResolvedValue([]),
    findBy: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
};

describe('RolesService', () => {
    let service: RolesService;
    let roleRepo: Repository<Role>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesService,
                {
                    provide: getRepositoryToken(Role),
                    useValue: mockRoleRepository,
                },
                {
                    provide: getRepositoryToken(Permission),
                    useValue: mockPermissionRepository,
                },
            ],
        }).compile();

        service = module.get<RolesService>(RolesService);
        roleRepo = module.get<Repository<Role>>(getRepositoryToken(Role));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create a role', async () => {
            const dto = { name: 'New Role', description: 'Desc', permissionIds: ['p1'] };
            const perms = [{ id: 'p1', action: 'a' } as Permission];

            (mockPermissionRepository.findBy as jest.Mock).mockResolvedValue(perms);

            expect(await service.create(dto)).toEqual(mockRole);

            expect(roleRepo.create).toHaveBeenCalledWith(dto);
            expect(mockPermissionRepository.findBy).toHaveBeenCalledWith({ id: expect.any(Object) }); // In(['p1'])
            expect(roleRepo.save).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return an array of roles', async () => {
            const roles = await service.findAll();
            expect(roles).toEqual([mockRole]);
            expect(roleRepo.find).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should get a single role', async () => {
            const repoSpy = jest.spyOn(roleRepo, 'findOne');
            expect(await service.findOne('role-1')).toEqual(mockRole);
            expect(repoSpy).toHaveBeenCalledWith({
                where: { id: 'role-1' },
                relations: ['permissions'],
            });
        });
    });

    describe('remove', () => {
        it('should call delete with the passed id', async () => {
            await service.remove('role-1');
            expect(roleRepo.delete).toHaveBeenCalledWith('role-1');
        });
    });
});
