import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryProfile } from './entities/salary-profile.entity';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class SalariesService {
    constructor(
        @InjectRepository(SalaryProfile)
        private salaryRepository: Repository<SalaryProfile>,
        private employeesService: EmployeesService,
    ) { }

    async createOrUpdate(employeeId: string, data: Partial<SalaryProfile>) {
        const employee = await this.employeesService.findOne(employeeId);
        if (!employee) throw new NotFoundException('Employee not found');

        let profile = await this.salaryRepository.findOne({ where: { employeeId } });
        if (!profile) {
            profile = this.salaryRepository.create({ ...data, employeeId });
        } else {
            Object.assign(profile, data);
        }

        return this.salaryRepository.save(profile);
    }

    async findOne(employeeId: string) {
        return this.salaryRepository.findOne({ where: { employeeId } });
    }
}
