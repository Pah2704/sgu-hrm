import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from './audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    constructor(private auditService: AuditLogsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, user, body, ip } = req;

        // Only log mutative actions
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle().pipe(
                tap(async () => {
                    try {
                        this.logger.log(`Audit Log Triggered. Method: ${method}, URL: ${url}`);
                        this.logger.log(`User: ${JSON.stringify(user)}`);
                        let action = method;
                        // Use basic heuristic for resource
                        // url like /employees/123 -> Resource: employees, ID: 123
                        const parts = url.split('/').filter(p => p);
                        // Assumption: API prefix removed or handled? NestJS usually keeps full path.
                        // parts[0] might be 'api' or the resource.
                        const resource = parts.length > 0 ? parts[0] : 'Unknown';
                        const resourceId = parts.length > 1 ? parts[1] : null;

                        // Sanitize Body
                        const safeBody = { ...body };
                        if (safeBody.password) safeBody.password = '***';

                        await this.auditService.logAction({
                            userId: user?.userId, // JWT payload usually has userId
                            action,
                            resource,
                            resourceId: resourceId || (method === 'POST' ? 'NEW' : null), // For POST, ID might be in response, but getting it from response stream is harder. keeping simple.
                            details: JSON.stringify(safeBody),
                            ip: ip || req.socket.remoteAddress
                        });
                    } catch (err) {
                        this.logger.error('Failed to log audit', err);
                    }
                }),
            );
        }

        return next.handle();
    }
}
