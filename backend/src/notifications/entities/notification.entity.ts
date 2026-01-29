import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ALERT = 'ALERT',
    SUCCESS = 'SUCCESS',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    userId: string;

    @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({ type: 'enum', enum: NotificationType, default: NotificationType.INFO })
    type: NotificationType;

    @Column({ default: false })
    isRead: boolean;

    @Column({ nullable: true }) // Optional link to a resource (e.g., employeeId)
    relatedId: string;

    @Column({ nullable: true })
    relatedType: string; // e.g., 'employee', 'contract'

    @CreateDateColumn()
    createdAt: Date;
}
