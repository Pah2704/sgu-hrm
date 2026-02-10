import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { RbacModule } from './rbac';
import { UsersModule } from './users';
import { OrganizationsModule } from './organizations';
import { EmployeesModule } from './employees/employees.module';
import { ContractsModule } from './contracts/contracts.module';
import { PositionsModule } from './modules/positions/positions.module';
import { DecisionsModule } from './modules/decisions/decisions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    RbacModule,
    UsersModule,
    OrganizationsModule,
    EmployeesModule,
    ContractsModule,
    PositionsModule,
    DecisionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global validation pipe
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
