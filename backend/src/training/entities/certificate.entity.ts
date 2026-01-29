import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum CertificateType {
    DOMESTIC = 'Trong nước',
    INTERNATIONAL = 'Quốc tế',
}

@Entity('certificates')
export class Certificate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: CertificateType, default: CertificateType.DOMESTIC })
    type: CertificateType;

    @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column()
    employeeId: string;

    @Column()
    name: string; // Tên chứng chỉ

    @Column()
    issuer: string; // Đơn vị cấp

    @Column({ nullable: true })
    certificateNumber: string; // Số hiệu

    @Column({ type: 'date', nullable: true })
    issueDate: Date;

    @Column({ type: 'date', nullable: true })
    expiryDate: Date;

    @Column({ nullable: true })
    result: string; // Kết quả/Xếp loại

    @Column({ nullable: true })
    scanUrl: string; // File scan

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
