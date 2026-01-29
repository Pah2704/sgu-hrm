import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalariesService } from './salaries.service';

@Controller('salaries')
@UseGuards(JwtAuthGuard)
export class SalariesController {
    constructor(private readonly salariesService: SalariesService) { }

    @Get(':employeeId')
    findOne(@Param('employeeId') employeeId: string) {
        return this.salariesService.findOne(employeeId);
    }

    @Post(':employeeId')
    createOrUpdate(@Param('employeeId') employeeId: string, @Body() data: any) {
        return this.salariesService.createOrUpdate(employeeId, data);
    }
}
