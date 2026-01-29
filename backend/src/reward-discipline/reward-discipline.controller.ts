import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RewardDisciplineService } from './reward-discipline.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reward-discipline')
@UseGuards(JwtAuthGuard)
export class RewardDisciplineController {
    constructor(private readonly service: RewardDisciplineService) { }

    @Post()
    create(@Body() createDto: any) {
        return this.service.create(createDto);
    }

    @Get()
    findAll(@Query('employeeId') employeeId: string, @Query('type') type?: string) {
        return this.service.findAllByEmployee(employeeId, type);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.service.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
