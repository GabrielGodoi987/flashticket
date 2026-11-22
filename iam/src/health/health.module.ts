import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: Pool,
      useFactory: () =>
        new Pool({
          host: process.env.DB_HOST ?? 'localhost',
          port: Number(process.env.DB_PORT ?? 5432),
          user: process.env.DB_USER ?? 'iam',
          password: process.env.DB_PASSWORD ?? 'iam',
          database: process.env.DB_NAME ?? 'iam',
          connectionTimeoutMillis: 3000,
        }),
    },
    HealthService,
  ],
})
export class HealthModule {}
