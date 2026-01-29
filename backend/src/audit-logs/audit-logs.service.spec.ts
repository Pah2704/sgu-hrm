import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { Repository } from 'typeorm';

const mockLogRepository = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
};

describe('AuditLogsService', () => {
    let service: AuditLogsService;
    let repo: Repository<AuditLog>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditLogsService,
                {
                    provide: getRepositoryToken(AuditLog),
                    useValue: mockLogRepository,
                },
            ],
        }).compile();

        service = module.get<AuditLogsService>(AuditLogsService);
        repo = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('logAction', () => {
        it('should save a log entry', async () => {
            const spy = jest.spyOn(repo, 'save');
            await service.logAction({
                userId: 'user-1',
                action: 'TEST',
                resource: 'Test',
                resourceId: '1',
                details: '{}',
                ip: '127.0.0.1'
            });
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({
                action: 'TEST',
                userId: 'user-1'
            }));
        });
    });
});
