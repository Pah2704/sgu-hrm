import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    userId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    action: string; // CREATE, UPDATE, DELETE

    @Column()
    resource: string; // e.g., 'Employee', 'Contract'

    @Column({ nullable: true })
    resourceId: string;

    @Column('text', { nullable: true })
    details: string; // JSON string of changes or body

    @Column({ nullable: true })
    ip: string;

    @CreateDateColumn()
    createdAt: Date;
}
