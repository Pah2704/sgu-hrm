import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('work_history')
export class WorkHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column()
    employeeId: string;

    @Column({ type: 'date' })
    fromDate: Date;

    @Column({ type: 'date', nullable: true })
    toDate: Date;

    @Column()
    workplace: string; // Cơ quan, đơn vị, doanh nghiệp

    @Column({ nullable: true })
    department: string; // Phòng ban / Khoa

    @Column()
    position: string; // Chức vụ / Chức danh

    @Column({ nullable: true })
    referenceNumber: string; // Số quyết định (nếu có)

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
