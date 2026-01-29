import { Test, TestingModule } from '@nestjs/testing';
import { TrainingService } from './training.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Degree } from './entities/degree.entity';
import { Certificate } from './entities/certificate.entity';
import { TrainingLevel } from './entities/training-level.entity';
import { TrainingField } from './entities/training-field.entity';

const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
};

describe('TrainingService', () => {
    let service: TrainingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TrainingService,
                { provide: getRepositoryToken(Degree), useValue: mockRepository },
                { provide: getRepositoryToken(Certificate), useValue: mockRepository },
                { provide: getRepositoryToken(TrainingLevel), useValue: mockRepository },
                { provide: getRepositoryToken(TrainingField), useValue: mockRepository },
            ],
        }).compile();

        service = module.get<TrainingService>(TrainingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a degree', async () => {
        const dto = { name: 'Bachelor' };
        mockRepository.create.mockReturnValue(dto);
        mockRepository.save.mockResolvedValue({ id: '1', ...dto });

        const result = await service.createDegree(dto);
        expect(result).toEqual({ id: '1', ...dto });
    });

    it('should find degrees by employee', async () => {
        mockRepository.find.mockResolvedValue([]);
        expect(await service.getDegreesByEmployee('emp1')).toEqual([]);
    });
});
