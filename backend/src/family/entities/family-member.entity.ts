import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('family_members')
export class FamilyMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: Employee;

    @Column()
    employeeId: string;

    @Column()
    fullName: string;

    @Column()
    relation: string; // Vợ, Chồng, Con, Cha, Mẹ...

    @Column({ type: 'int', nullable: true })
    birthYear: number;

    @Column({ nullable: true })
    job: string; // Nghề nghiệp / Nơi làm việc

    @Column({ nullable: true })
    address: string; // Nơi ở hiện nay

    @Column({ nullable: true })
    hometown: string; // Quê quán

    @Column({ nullable: true })
    politicalOrganization: string; // Tổ chức chính trị - xã hội

    @Column({ nullable: true })
    politicalPosition: string; // Chức vụ trong tổ chức

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
