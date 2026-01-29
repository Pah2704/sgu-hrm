import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';

const mockContractsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

const mockRender = jest.fn();
const mockGenerate = jest.fn().mockReturnValue(Buffer.from('mocked zip'));

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    readFileSync: jest.fn().mockReturnValue('dummy content'),
}));

jest.mock('pizzip', () => {
    return jest.fn().mockImplementation(() => ({}));
});

jest.mock('docxtemplater', () => {
    return jest.fn().mockImplementation(() => ({
        render: mockRender,
        getZip: jest.fn().mockReturnValue({
            generate: mockGenerate,
        }),
    }));
});

describe('ContractsService', () => {
    let service: ContractsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContractsService,
                {
                    provide: getRepositoryToken(Contract),
                    useValue: mockContractsRepository,
                },
            ],
        }).compile();

        service = module.get<ContractsService>(ContractsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('exportContract', () => {
        it('should handle missing employee safely', async () => {
            const mockContract = {
                id: '1',
                employeeId: 'emp-1',
                employee: null,
                startDate: '2023-01-01',
            };
            mockContractsRepository.findOne.mockResolvedValue(mockContract);

            await service.exportContract('1');

            expect(mockRender).toHaveBeenCalledWith(expect.objectContaining({
                employeeName: '',
            }));
        });

        it('should handle missing employee fullName safely', async () => {
            const mockContract = {
                id: '1',
                employeeId: 'emp-1',
                employee: { fullName: null },
                startDate: '2023-01-01',
            };
            mockContractsRepository.findOne.mockResolvedValue(mockContract);

            await service.exportContract('1');

            expect(mockRender).toHaveBeenCalledWith(expect.objectContaining({
                employeeName: '',
            }));
        });

        it('should format dates correctly using vi-VN locale', async () => {
            const mockContract = {
                id: '1',
                employeeId: 'emp-1',
                employee: { fullName: 'Nguyen Van A' },
                startDate: '2023-12-31',
            };
            mockContractsRepository.findOne.mockResolvedValue(mockContract);

            await service.exportContract('1');

            expect(mockRender).toHaveBeenCalledWith(expect.objectContaining({
                employeeName: 'NGUYEN VAN A',
                startDate: '31/12/2023',
            }));
        });

        it('should throw error if contract not found', async () => {
            mockContractsRepository.findOne.mockResolvedValue(null);

            await expect(service.exportContract('non-existent')).rejects.toThrow('Contract not found');
        });
    });
});
