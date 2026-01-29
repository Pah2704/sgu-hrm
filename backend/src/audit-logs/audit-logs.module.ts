import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLog } from './entities/audit-log.entity';

@Global() // Global so Interceptor can use it anywhere?
@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    controllers: [AuditLogsController],
    providers: [AuditLogsService],
    exports: [AuditLogsService],
})
export class AuditLogsModule { }
