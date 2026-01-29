import { Test, TestingModule } from '@nestjs/testing';
import { FamilyService } from './family.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FamilyMember } from './entities/family-member.entity';

const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('FamilyService', () => {
    let service: FamilyService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FamilyService,
                {
                    provide: getRepositoryToken(FamilyMember),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<FamilyService>(FamilyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create family member', async () => {
        const dto = { fullName: 'Wife', relation: 'Wife' };
        mockRepository.create.mockReturnValue(dto);
        mockRepository.save.mockResolvedValue({ id: '1', ...dto });

        const result = await service.create(dto);
        expect(result).toEqual({ id: '1', ...dto });
    });
});
