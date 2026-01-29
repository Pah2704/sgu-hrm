import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';

@Injectable()
export class ContractsService {
    constructor(
        @InjectRepository(Contract)
        private contractsRepository: Repository<Contract>,
    ) { }

    create(createContractDto: any) {
        const contract = this.contractsRepository.create(createContractDto);
        return this.contractsRepository.save(contract);
    }

    findAll() {
        return this.contractsRepository.find({ relations: ['employee'] });
    }

    findOne(id: string) {
        return this.contractsRepository.findOne({ where: { id }, relations: ['employee'] });
    }

    findByEmployee(employeeId: string) {
        return this.contractsRepository.find({ where: { employeeId }, order: { startDate: 'DESC' } });
    }

    async update(id: string, updateContractDto: any) {
        await this.contractsRepository.update(id, updateContractDto);
        return this.findOne(id);
    }

    async exportContract(id: string): Promise<Buffer> {
        // Lazy load dependencies to avoid issues if not installed yet, though they should be.
        const fs = require('fs');
        const path = require('path');
        const PizZip = require('pizzip');
        const Docxtemplater = require('docxtemplater');

        const contract = await this.findOne(id);
        if (!contract) {
            throw new Error('Contract not found');
        }

        // Load template
        // Ideally, different templates for different contract types
        const templateName = 'contract-template.docx';
        const content = fs.readFileSync(
            path.resolve(__dirname, `../../templates/${templateName}`),
            'binary'
        );

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Format data
        const data = {
            ...contract,
            employeeName: (contract.employee?.fullName || '').toUpperCase(),
            startDate: contract.startDate ? new Date(contract.startDate).toLocaleDateString('vi-VN') : '',
            // Add other mappings
        };

        doc.render(data);

        return doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });
    }

    remove(id: string) {
        return this.contractsRepository.delete(id);
    }
}
