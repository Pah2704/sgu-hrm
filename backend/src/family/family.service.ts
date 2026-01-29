import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyMember } from './entities/family-member.entity';

@Injectable()
export class FamilyService {
    constructor(
        @InjectRepository(FamilyMember)
        private repo: Repository<FamilyMember>,
    ) { }

    create(data: any) {
        const item = this.repo.create(data);
        return this.repo.save(item);
    }

    findAllByEmployee(employeeId: string) {
        return this.repo.find({
            where: { employeeId },
            order: { birthYear: 'ASC' },
        });
    }

    update(id: string, data: any) {
        return this.repo.update(id, data);
    }

    remove(id: string) {
        return this.repo.delete(id);
    }
}
