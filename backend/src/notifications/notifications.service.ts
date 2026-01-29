import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification, NotificationType } from './entities/notification.entity';
import { Contract, ContractStatus } from '../contracts/entities/contract.entity';
import { SalaryProfile } from '../salaries/entities/salary-profile.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,
        @InjectRepository(Contract)
        private contractRepo: Repository<Contract>,
        @InjectRepository(SalaryProfile)
        private salaryRepo: Repository<SalaryProfile>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async create(data: Partial<Notification>) {
        const notif = this.notificationRepo.create(data);
        return this.notificationRepo.save(notif);
    }

    async findAllByUser(userId: string) {
        return this.notificationRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50 // Limit to last 50
        });
    }

    async markAsRead(id: string) {
        return this.notificationRepo.update(id, { isRead: true });
    }

    async markAllAsRead(userId: string) {
        return this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    }

    async getUnreadCount(userId: string) {
        return this.notificationRepo.count({ where: { userId, isRead: false } });
    }

    // --- CRON JOBS ---

    // Run every day at 8:00 AM
    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async checkExpiringContracts() {
        this.logger.log('Checking expiring contracts...');

        // Target: Contracts expiring in exactly 60 days and 30 days
        const targetDays = [60, 30];

        for (const days of targetDays) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + days);
            const dateStr = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD

            const contracts = await this.contractRepo.createQueryBuilder('contract')
                .leftJoinAndSelect('contract.employee', 'employee')
                .where('contract.endDate = :date', { date: dateStr })
                .andWhere('contract.status = :status', { status: ContractStatus.ACTIVE })
                .getMany();

            if (contracts.length > 0) {
                await this.notifyAdminsAndHR(
                    `Hợp đồng hết hạn (${days} ngày)`,
                    `Có ${contracts.length} hợp đồng sắp hết hạn vào ngày ${dateStr}.`,
                    NotificationType.WARNING,
                    'contract_expiry' // relatedType generic
                );
            }
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async checkSalaryRaises() {
        this.logger.log('Checking salary raises...');
        // Logic: 3 years from startDate
        // Find salaries where startDate + 3 years = Today + 30 days(?)

        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30); // 30 days notice

        // We look for startDate matching (FutureDate - 3 Years)
        // e.g. Due: 2026-06-01. StartDate was 2023-06-01.
        // So startDate = FutureDate - 3 years.

        const targetStartDate = new Date(futureDate);
        targetStartDate.setFullYear(targetStartDate.getFullYear() - 3);
        const dateStr = targetStartDate.toISOString().split('T')[0];

        // This is a simplified check (only exact date).
        // For production, maybe check range or ensure data is clean.

        const salaries = await this.salaryRepo.createQueryBuilder('salary')
            .leftJoinAndSelect('salary.employee', 'employee')
            .where('salary.startDate = :date', { date: dateStr })
            .getMany();

        if (salaries.length > 0) {
            await this.notifyAdminsAndHR(
                'Đến hạn nâng lương',
                `Có ${salaries.length} nhân sự đến hạn nâng lương vào ngày ${futureDate.toISOString().split('T')[0]}.`,
                NotificationType.INFO,
                'salary_raise'
            );
        }
    }

    private async notifyAdminsAndHR(title: string, message: string, type: NotificationType, relatedType?: string) {
        // Find all Admin and HR
        const recipients = await this.userRepo.find({
            where: [
                { role: UserRole.ADMIN },
                { role: UserRole.HR }
            ]
        });

        const notifications = recipients.map(user => ({
            userId: user.id,
            title,
            message,
            type,
            relatedType,
            isRead: false
        }));

        if (notifications.length > 0) {
            await this.notificationRepo.save(notifications);
            this.logger.log(`Created ${notifications.length} notifications for ${title}`);
        }
    }
}
