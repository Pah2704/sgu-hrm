import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { SalaryProfile } from '../salaries/entities/salary-profile.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, Contract, SalaryProfile, User])
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
})
export class NotificationsModule { }
