import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmployeesModule } from '../employees/employees.module';
import { RolesModule } from '../roles/roles.module';
import { User } from './entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User]), EmployeesModule, RolesModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
