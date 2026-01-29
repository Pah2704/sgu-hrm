import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum LeaveType {
    ANNUAL = 'Nghỉ phép năm',
    SICK = 'Nghỉ ốm',
    UNPAID = 'Nghỉ không lương',
    OTHER = 'Khác',
}

export enum LeaveStatus {
    PENDING = 'Chờ duyệt',
    APPROVED = 'Đã duyệt',
    REJECTED = 'Từ chối',
}

@Entity()
export class LeaveRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: LeaveType })
    type: LeaveType;

    @Column({ type: 'date' })
    startDate: string;

    @Column({ type: 'date' })
    endDate: string;

    @Column({ type: 'text' })
    reason: string;

    @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
    status: LeaveStatus;

    @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column()
    employeeId: string;

    @Column({ nullable: true })
    approverId: string; // User ID of the approver (Admin/Manager)

    @Column({ nullable: true })
    rejectionReason: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
