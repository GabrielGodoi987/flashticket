import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  OnModuleDestroy,
} from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly logger = new Logger(HealthService.name);

  constructor(@Inject(Pool) private readonly pool: Pool) {}

  async check(): Promise<{ status: string; database: string }> {
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ok', database: 'ok' };
    } catch (error) {
      this.logger.warn(
        `PostgreSQL health query failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unavailable',
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
