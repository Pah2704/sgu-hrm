import { Test, TestingModule } from '@nestjs/testing';
import { LeavesService } from './leaves.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaveRequest, LeaveStatus } from './entities/leave-request.entity';

const mockLeavesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('LeavesService', () => {
    let service: LeavesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LeavesService,
                {
                    provide: getRepositoryToken(LeaveRequest),
                    useValue: mockLeavesRepository,
                },
            ],
        }).compile();

        service = module.get<LeavesService>(LeavesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a leave request', async () => {
        const dto = { type: 'Annual', startDate: '2023-01-01', endDate: '2023-01-02', reason: 'Vacation' };
        mockLeavesRepository.create.mockReturnValue(dto);
        mockLeavesRepository.save.mockResolvedValue({ id: '1', ...dto, status: LeaveStatus.PENDING });

        const result = await service.create(dto);
        expect(result).toEqual({ id: '1', ...dto, status: LeaveStatus.PENDING });
    });

    it('should find pending leaves', async () => {
        const pendingLeaves = [{ id: '1', status: LeaveStatus.PENDING }];
        mockLeavesRepository.find.mockResolvedValue(pendingLeaves);

        const result = await service.findPending();
        expect(result).toEqual(pendingLeaves);
        expect(mockLeavesRepository.find).toHaveBeenCalledWith(expect.objectContaining({ where: { status: LeaveStatus.PENDING } }));
    });

    it('should update status', async () => {
        const id = '1';
        const status = LeaveStatus.APPROVED;
        const approverId = 'admin-id';
        mockLeavesRepository.update.mockResolvedValue({ affected: 1 });
        mockLeavesRepository.findOne.mockResolvedValue({ id, status, approverId });

        const result = await service.updateStatus(id, status, approverId);
        expect(result).toEqual({ id, status, approverId });
        expect(mockLeavesRepository.update).toHaveBeenCalledWith(id, { status, approverId });
    });
});
