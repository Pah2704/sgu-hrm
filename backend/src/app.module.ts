import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditInterceptor } from './audit-logs/audit.interceptor';
import { EmployeesModule } from './employees/employees.module';
import { Employee } from './employees/entities/employee.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UnitsModule } from './units/units.module';
import { ContractsModule } from './contracts/contracts.module';
import { LeavesModule } from './leaves/leaves.module';
import { User } from './users/entities/user.entity';
import { Unit } from './units/entities/unit.entity';
import { Contract } from './contracts/entities/contract.entity';
import { LeaveRequest } from './leaves/entities/leave-request.entity';

import { ReportsModule } from './reports/reports.module';
import { SalariesModule } from './salaries/salaries.module';
import { RewardDisciplineModule } from './reward-discipline/reward-discipline.module';
import { TrainingModule } from './training/training.module';
import { WorkHistoryModule } from './work-history/work-history.module';
import { FamilyModule } from './family/family.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

import { RolesModule } from './roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true, // Auto create tables
            }),
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        EmployeesModule,
        UsersModule,
        AuthModule,
        UnitsModule,
        ContractsModule,
        LeavesModule,
        ReportsModule,
        SalariesModule,
        RewardDisciplineModule,
        TrainingModule,
        WorkHistoryModule,
        WorkHistoryModule,
        FamilyModule,
        ScheduleModule.forRoot(),
        NotificationsModule,
        AuditLogsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
})
export class AppModule { }
