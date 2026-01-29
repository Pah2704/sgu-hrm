import { Test, TestingModule } from '@nestjs/testing';
import { WorkHistoryService } from './work-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkHistory } from './entities/work-history.entity';

const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('WorkHistoryService', () => {
    let service: WorkHistoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkHistoryService,
                {
                    provide: getRepositoryToken(WorkHistory),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<WorkHistoryService>(WorkHistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create work history', async () => {
        const dto = { workplace: 'Company A' };
        mockRepository.create.mockReturnValue(dto);
        mockRepository.save.mockResolvedValue({ id: '1', ...dto });

        const result = await service.create(dto);
        expect(result).toEqual({ id: '1', ...dto });
    });
});
