import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardDisciplineService } from './reward-discipline.service';
import { RewardDisciplineController } from './reward-discipline.controller';
import { RewardDiscipline } from './entities/reward-discipline.entity';
import { EmployeesModule } from '../employees/employees.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([RewardDiscipline]),
        EmployeesModule,
    ],
    controllers: [RewardDisciplineController],
    providers: [RewardDisciplineService],
    exports: [RewardDisciplineService],
})
export class RewardDisciplineModule { }
