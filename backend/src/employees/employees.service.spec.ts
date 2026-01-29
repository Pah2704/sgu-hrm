import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';

const mockEmployeeRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
};

describe('EmployeesService', () => {
    let service: EmployeesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmployeesService,
                {
                    provide: getRepositoryToken(Employee),
                    useValue: mockEmployeeRepository,
                },
            ],
        }).compile();

        service = module.get<EmployeesService>(EmployeesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create an employee', async () => {
        const dto = { fullName: 'Test Name' };
        mockEmployeeRepository.create.mockReturnValue(dto);
        mockEmployeeRepository.save.mockResolvedValue({ id: '1', ...dto });

        const result = await service.create(dto as any);
        expect(result).toEqual({ id: '1', ...dto });
        expect(mockEmployeeRepository.create).toHaveBeenCalledWith(dto);
    });
});
