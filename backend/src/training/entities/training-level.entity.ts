import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Degree } from './degree.entity';

@Entity('training_levels')
export class TrainingLevel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // e.g., Tiến sĩ, Thạc sĩ, Đại học, Cao đẳng

    @Column({ unique: true })
    code: string; // e.g., TS, THS, DH

    @OneToMany(() => Degree, degree => degree.level)
    degrees: Degree[];
}
