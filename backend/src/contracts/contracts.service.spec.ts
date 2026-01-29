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
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // Add more tests
});
