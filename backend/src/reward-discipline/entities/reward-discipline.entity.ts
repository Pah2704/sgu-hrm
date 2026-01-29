import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum RewardDisciplineType {
    REWARD = 'REWARD',
    DISCIPLINE = 'DISCIPLINE',
}

@Entity('reward_disciplines')
export class RewardDiscipline {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: RewardDisciplineType })
    type: RewardDisciplineType;

    @Column() // Reason or Content (Lý do / Nội dung)
    reason: string;

    @Column() // Form of reward/discipline (Hình thức: Giấy khen, Tiền mặt / Khiển trách, Cảnh cáo)
    form: string;

    @Column({ nullable: true })
    decisionNumber: string; // Số quyết định

    @Column({ type: 'date', nullable: true })
    decisionDate: string; // Ngày quyết định

    @Column({ type: 'date', nullable: true })
    signDate: string; // Ngày ký

    @Column({ nullable: true })
    signer: string; // Người ký

    @ManyToOne(() => Employee, (employee) => employee.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column()
    employeeId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
