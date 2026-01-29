import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkHistoryService } from './work-history.service';

@Controller('work-history')
@UseGuards(JwtAuthGuard)
export class WorkHistoryController {
    constructor(private readonly service: WorkHistoryService) { }

    @Post()
    create(@Body() data: any) {
        return this.service.create(data);
    }

    @Get()
    findAll(@Query('employeeId') employeeId: string) {
        return this.service.findAllByEmployee(employeeId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.service.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
