import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { Degree } from './entities/degree.entity';
import { Certificate } from './entities/certificate.entity';
import { TrainingLevel } from './entities/training-level.entity';
import { TrainingField } from './entities/training-field.entity';
import { EmployeesModule } from '../employees/employees.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Degree, Certificate, TrainingLevel, TrainingField]),
        EmployeesModule,
    ],
    controllers: [TrainingController],
    providers: [TrainingService],
    exports: [TrainingService],
})
export class TrainingModule { }
