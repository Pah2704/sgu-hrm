import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkHistoryService } from './work-history.service';
import { WorkHistoryController } from './work-history.controller';
import { WorkHistory } from './entities/work-history.entity';

@Module({
    imports: [TypeOrmModule.forFeature([WorkHistory])],
    controllers: [WorkHistoryController],
    providers: [WorkHistoryService],
    exports: [WorkHistoryService],
})
export class WorkHistoryModule { }
