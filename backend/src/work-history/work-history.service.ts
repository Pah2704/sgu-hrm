import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkHistory } from './entities/work-history.entity';

@Injectable()
export class WorkHistoryService {
    constructor(
        @InjectRepository(WorkHistory)
        private repo: Repository<WorkHistory>,
    ) { }

    create(data: any) {
        const item = this.repo.create(data);
        return this.repo.save(item);
    }

    findAllByEmployee(employeeId: string) {
        return this.repo.find({
            where: { employeeId },
            order: { fromDate: 'DESC' },
        });
    }

    update(id: string, data: any) {
        return this.repo.update(id, data);
    }

    remove(id: string) {
        return this.repo.delete(id);
    }
}
