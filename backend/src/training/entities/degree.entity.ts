import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { TrainingLevel } from './training-level.entity';
import { TrainingField } from './training-field.entity';

export enum DegreeClassification {
    DOMESTIC = 'Trong nước',
    FOREIGN = 'Nước ngoài',
    JOINT = 'Liên kết',
}

@Entity('degrees')
export class Degree {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: DegreeClassification, default: DegreeClassification.DOMESTIC })
    classification: DegreeClassification;

    @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column()
    employeeId: string;

    @ManyToOne(() => TrainingLevel)
    @JoinColumn({ name: 'levelId' })
    level: TrainingLevel;

    @Column({ nullable: true })
    levelId: string;

    @ManyToOne(() => TrainingField)
    @JoinColumn({ name: 'fieldId' })
    field: TrainingField;

    @Column({ nullable: true })
    fieldId: string;

    @Column()
    major: string; // Chuyên ngành

    @Column()
    institution: string; // Cơ sở đào tạo

    @Column({ nullable: true })
    country: string; // Quốc gia cấp (nếu nước ngoài)

    @Column({ nullable: true })
    mode: string; // Hình thức đào tạo (Chính quy, ...)

    @Column({ nullable: true })
    language: string; // Ngôn ngữ đào tạo

    @Column({ nullable: true })
    year: number; // Năm tốt nghiệp

    @Column({ nullable: true })
    ranking: string; // Xếp loại

    @Column({ nullable: true })
    degreeNumber: string; // Số hiệu văn bằng

    @Column({ type: 'date', nullable: true })
    signDate: Date; // Ngày ký

    @Column({ nullable: true })
    scanUrl: string; // Đường dẫn file scan văn bằng

    @Column({ nullable: true })
    recognitionUrl: string; // Giấy công nhận (nếu có)

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
