import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity()
export class SalaryProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Employee)
    @JoinColumn()
    employee: Employee;

    @Column()
    employeeId: string;

    @Column({ nullable: true })
    civilServantGrade: string; // Mã ngạch (e.g. V.07.01.03)

    @Column({ type: 'int', default: 1 })
    salaryGrade: number; // Bậc lương

    @Column({ type: 'float', default: 2.34 })
    coefficient: number; // Hệ số lương

    @Column({ type: 'float', default: 0 })
    positionAllowance: number; // Phụ cấp chức vụ

    @Column({ type: 'float', default: 0 })
    otherAllowance: number; // Phụ cấp khác

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    startDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
