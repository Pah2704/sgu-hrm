import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Employee } from '../employees/entities/employee.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { Unit } from '../units/entities/unit.entity';

import { Degree } from '../training/entities/degree.entity';
import { RewardDiscipline } from '../reward-discipline/entities/reward-discipline.entity';
import { SalaryProfile } from '../salaries/entities/salary-profile.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Employee, Contract, LeaveRequest, Unit, Degree, RewardDiscipline, SalaryProfile]),
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
