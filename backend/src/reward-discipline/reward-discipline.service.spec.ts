import { Test, TestingModule } from '@nestjs/testing';
import { RewardDisciplineService } from './reward-discipline.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RewardDiscipline } from './entities/reward-discipline.entity';

import { EmployeesService } from '../employees/employees.service';

const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(), // Add findOne for repo
    remove: jest.fn(),
};

const mockEmployeesService = {
    findOne: jest.fn(),
};

describe('RewardDisciplineService', () => {
    let service: RewardDisciplineService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RewardDisciplineService,
                {
                    provide: getRepositoryToken(RewardDiscipline),
                    useValue: mockRepository,
                },
                {
                    provide: EmployeesService,
                    useValue: mockEmployeesService,
                },
            ],
        }).compile();

        service = module.get<RewardDisciplineService>(RewardDisciplineService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a record', async () => {
        const dto = { type: 'Khen thưởng', reason: 'Good job', employeeId: 'emp1' };
        mockEmployeesService.findOne.mockResolvedValue({ id: 'emp1' }); // Found employee
        mockRepository.create.mockReturnValue(dto);
        mockRepository.save.mockResolvedValue({ id: '1', ...dto });

        const result = await service.create(dto);
        expect(result).toEqual({ id: '1', ...dto });
    });

    it('should find all by employee', async () => {
        const result = [{ id: '1', type: 'Khen thưởng' }];
        mockRepository.find.mockResolvedValue(result);

        expect(await service.findAllByEmployee('emp1')).toEqual(result);
    });
});
