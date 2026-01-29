import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
    constructor(
        @InjectRepository(Unit)
        private unitsRepository: TreeRepository<Unit>,
    ) { }

    async create(createUnitDto: any) {
        const parent = createUnitDto.parentId ? await this.unitsRepository.findOne({ where: { id: createUnitDto.parentId } }) : null;
        const unit = this.unitsRepository.create({ ...createUnitDto, parent });
        return this.unitsRepository.save(unit);
    }

    async findAll() {
        return this.unitsRepository.findTrees();
    }

    async findOne(id: string) {
        return this.unitsRepository.findOne({ where: { id }, relations: ['parent', 'children'] });
    }

    async update(id: string, updateUnitDto: any) {
        const unit = await this.unitsRepository.findOne({ where: { id } });
        if (!unit) {
            throw new Error('Unit not found');
        }
        if (updateUnitDto.parentId) {
            unit.parent = await this.unitsRepository.findOne({ where: { id: updateUnitDto.parentId } });
        }
        Object.assign(unit, updateUnitDto);
        return this.unitsRepository.save(unit);
    }

    async remove(id: string) {
        return this.unitsRepository.delete(id);
    }
}
