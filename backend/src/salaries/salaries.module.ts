import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalariesService } from './salaries.service';
import { SalariesController } from './salaries.controller';
import { SalaryProfile } from './entities/salary-profile.entity';
import { EmployeesModule } from '../employees/employees.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([SalaryProfile]),
        EmployeesModule
    ],
    controllers: [SalariesController],
    providers: [SalariesService],
    exports: [SalariesService]
})
export class SalariesModule { }
