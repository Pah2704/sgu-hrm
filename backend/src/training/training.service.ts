import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Degree } from './entities/degree.entity';
import { Certificate } from './entities/certificate.entity';
import { TrainingLevel } from './entities/training-level.entity';
import { TrainingField } from './entities/training-field.entity';

@Injectable()
export class TrainingService implements OnModuleInit {
    constructor(
        @InjectRepository(Degree) private degreeRepo: Repository<Degree>,
        @InjectRepository(Certificate) private certRepo: Repository<Certificate>,
        @InjectRepository(TrainingLevel) private levelRepo: Repository<TrainingLevel>,
        @InjectRepository(TrainingField) private fieldRepo: Repository<TrainingField>,
    ) { }

    async onModuleInit() {
        const levels = [
            { name: 'Tiến sĩ', code: 'TS' },
            { name: 'Thạc sĩ', code: 'THS' },
            { name: 'Đại học', code: 'DH' },
            { name: 'Cao đẳng', code: 'CD' },
            { name: 'Trung cấp', code: 'TC' },
            { name: 'Sơ cấp', code: 'SC' },
        ];

        for (const lvl of levels) {
            const exists = await this.levelRepo.findOne({ where: { code: lvl.code } });
            if (!exists) {
                await this.levelRepo.save(lvl);
            }
        }

        // Example Fields (Optional seeds)
        const fields = [
            { name: 'Công nghệ thông tin', code: '7480201' },
            { name: 'Quản trị kinh doanh', code: '7340101' },
            { name: 'Kế toán', code: '7340301' },
        ];
        for (const f of fields) {
            const exists = await this.fieldRepo.findOne({ where: { code: f.code } });
            if (!exists) {
                await this.fieldRepo.save(f);
            }
        }
    }

    // --- Levels & Fields ---
    async getLevels() {
        return this.levelRepo.find();
    }

    async getFields() {
        return this.fieldRepo.find();
    }

    // --- Degrees ---
    async createDegree(data: any) {
        const degree = this.degreeRepo.create(data);
        return this.degreeRepo.save(degree);
    }

    async getDegreesByEmployee(employeeId: string) {
        return this.degreeRepo.find({
            where: { employeeId },
            relations: ['level', 'field'],
        });
    }

    async updateDegree(id: string, data: any) {
        await this.degreeRepo.update(id, data);
        return this.degreeRepo.findOne({ where: { id }, relations: ['level', 'field'] });
    }

    async deleteDegree(id: string) {
        return this.degreeRepo.delete(id);
    }

    // --- Certificates ---
    async createCertificate(data: any) {
        const cert = this.certRepo.create(data);
        return this.certRepo.save(cert);
    }

    async getCertificatesByEmployee(employeeId: string) {
        return this.certRepo.find({ where: { employeeId } });
    }

    async updateCertificate(id: string, data: any) {
        await this.certRepo.update(id, data);
        return this.certRepo.findOne({ where: { id } });
    }

    async deleteCertificate(id: string) {
        return this.certRepo.delete(id);
    }
}
