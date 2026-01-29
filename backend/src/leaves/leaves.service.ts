import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest, LeaveStatus } from './entities/leave-request.entity';

@Injectable()
export class LeavesService {
    constructor(
        @InjectRepository(LeaveRequest)
        private leavesRepository: Repository<LeaveRequest>,
    ) { }

    create(createLeaveDto: any) {
        const leave = this.leavesRepository.create(createLeaveDto);
        return this.leavesRepository.save(leave);
    }

    findAll() {
        return this.leavesRepository.find({
            relations: ['employee'],
            order: { createdAt: 'DESC' }
        });
    }

    findByEmployee(employeeId: string) {
        return this.leavesRepository.find({
            where: { employeeId },
            relations: ['employee'],
            order: { createdAt: 'DESC' }
        });
    }

    findPending() {
        return this.leavesRepository.find({
            where: { status: LeaveStatus.PENDING },
            relations: ['employee'],
            order: { createdAt: 'ASC' }
        });
    }

    findOne(id: string) {
        return this.leavesRepository.findOne({ where: { id }, relations: ['employee'] });
    }

    async updateStatus(id: string, status: LeaveStatus, approverId: string) {
        await this.leavesRepository.update(id, { status, approverId });
        return this.findOne(id);
    }

    remove(id: string) {
        return this.leavesRepository.delete(id);
    }
}
