import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const envOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const fallbackOrigins = [
    process.env.HRM_APP_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter((origin): origin is string => Boolean(origin));

  const allowedOrigins =
    envOrigins.length > 0 ? envOrigins : Array.from(new Set(fallbackOrigins));

  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    // In development, allow any origin to support localhost/LAN access.
    // In production, restrict to explicitly configured origins.
    origin: isProduction ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(Number.isNaN(port) ? 3001 : port);
}
void bootstrap();
