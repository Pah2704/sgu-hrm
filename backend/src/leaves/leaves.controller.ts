import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeaveStatus } from './entities/leave-request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
    constructor(private readonly leavesService: LeavesService) { }

    @Post()
    create(@Body() createLeaveDto: any) {
        return this.leavesService.create(createLeaveDto);
    }

    @Get()
    findAll(@Query('employeeId') employeeId?: string, @Query('status') status?: string) {
        if (employeeId) {
            return this.leavesService.findByEmployee(employeeId);
        }
        if (status === 'pending') {
            return this.leavesService.findPending();
        }
        return this.leavesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leavesService.findOne(id);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: { status: LeaveStatus, approverId: string }
    ) {
        return this.leavesService.updateStatus(id, body.status, body.approverId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.leavesService.remove(id);
    }
}
