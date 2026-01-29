import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardDiscipline } from './entities/reward-discipline.entity';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class RewardDisciplineService {
    constructor(
        @InjectRepository(RewardDiscipline)
        private repo: Repository<RewardDiscipline>,
        private employeesService: EmployeesService,
    ) { }

    async create(createDto: any) {
        const employee = await this.employeesService.findOne(createDto.employeeId);
        if (!employee) throw new NotFoundException('Employee not found');

        const record = this.repo.create(createDto);
        return this.repo.save(record);
    }

    async findAllByEmployee(employeeId: string, type?: string) {
        const where: any = { employeeId };
        if (type) {
            where.type = type;
        }
        return this.repo.find({
            where,
            order: { decisionDate: 'DESC' },
        });
    }

    async findOne(id: string) {
        const record = await this.repo.findOne({ where: { id } });
        if (!record) throw new NotFoundException('Record not found');
        return record;
    }

    async update(id: string, updateDto: any) {
        const record = await this.findOne(id);
        Object.assign(record, updateDto);
        return this.repo.save(record);
    }

    async remove(id: string) {
        const record = await this.findOne(id);
        return this.repo.remove(record);
    }
}
