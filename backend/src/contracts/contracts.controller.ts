import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { ContractsService } from './contracts.service';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) { }

    @Post()
    create(@Body() createContractDto: any) {
        return this.contractsService.create(createContractDto);
    }

    @Get()
    findAll(@Query('employeeId') employeeId?: string) {
        if (employeeId) {
            return this.contractsService.findByEmployee(employeeId);
        }
        return this.contractsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contractsService.findOne(id);
    }

    @Get(':id/export')
    async export(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.contractsService.exportContract(id);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=contract-${id}.docx`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateContractDto: any) {
        return this.contractsService.update(id, updateContractDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contractsService.remove(id);
    }
}
