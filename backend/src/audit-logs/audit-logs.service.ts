import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
    constructor(
        @InjectRepository(AuditLog)
        private auditRepo: Repository<AuditLog>,
    ) { }

    async logAction(data: Partial<AuditLog>) {
        const log = this.auditRepo.create(data);
        return this.auditRepo.save(log);
    }

    async findAll(limit: number = 100) {
        return this.auditRepo.find({
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['user']
        });
    }
}
