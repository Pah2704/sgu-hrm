import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum ContractType {
    PROBATION = 'Thử việc',
    DEFINITE_TERM_12M = 'Có thời hạn 12 tháng',
    DEFINITE_TERM_36M = 'Có thời hạn 36 tháng',
    INDEFINITE_TERM = 'Không xác định thời hạn',
}

export enum ContractStatus {
    ACTIVE = 'Đang hiệu lực',
    EXPIRED = 'Hết hạn',
    TERMINATED = 'Đã chấm dứt',
}

@Entity()
export class Contract {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    contractNumber: string;

    @Column({ type: 'enum', enum: ContractType })
    type: ContractType;

    @Column({ type: 'date' })
    startDate: string;

    @Column({ type: 'date', nullable: true })
    endDate: string;

    @Column({ type: 'date', nullable: true })
    signingDate: string;

    @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.ACTIVE })
    status: ContractStatus;

    @Column({ nullable: true })
    basicSalary: number;

    @Column({ nullable: true })
    allowance: number;

    @Column({ nullable: true })
    note: string;

    @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column()
    employeeId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
