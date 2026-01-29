import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { LeaveRequest } from './entities/leave-request.entity';

@Module({
    imports: [TypeOrmModule.forFeature([LeaveRequest])],
    controllers: [LeavesController],
    providers: [LeavesService],
    exports: [LeavesService],
})
export class LeavesModule { }
