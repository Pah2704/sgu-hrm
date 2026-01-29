import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    action: string; // e.g., 'employee:create', 'salary:view'

    @Column({ nullable: true })
    description: string;
}
