import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Degree } from './degree.entity';

@Entity('training_fields')
export class TrainingField {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // e.g., Công nghệ thông tin

    @Column({ unique: true })
    code: string; // e.g., 7480201

    @OneToMany(() => Degree, degree => degree.field)
    degrees: Degree[];
}
