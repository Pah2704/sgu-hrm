import { Entity, Column, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, OneToMany } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity()
@Tree("closure-table")
export class Unit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column({ nullable: true })
    description: string;

    @TreeChildren()
    children: Unit[];

    @TreeParent()
    parent: Unit;

    @OneToMany(() => Employee, (employee) => employee.unit)
    employees: Employee[];
}
