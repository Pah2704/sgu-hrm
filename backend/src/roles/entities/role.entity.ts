import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string; // e.g., 'System Admin', 'HR Manager'

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    isSystem: boolean; // Cannot be deleted if true

    @ManyToMany(() => Permission, { cascade: true, eager: true }) // Eager load permissions
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'roleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
    })
    permissions: Permission[];
}
