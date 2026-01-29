import { Test, TestingModule } from '@nestjs/testing';
import { UnitsService } from './units.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity';

const mockUnitsRepository = {
    findTrees: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

describe('UnitsService', () => {
    let service: UnitsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UnitsService,
                {
                    provide: getRepositoryToken(Unit),
                    useValue: mockUnitsRepository,
                },
            ],
        }).compile();

        service = module.get<UnitsService>(UnitsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
