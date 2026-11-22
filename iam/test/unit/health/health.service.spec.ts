import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Pool } from 'pg';
import { HealthService } from '../../../src/health/health.service';

describe('HealthService', () => {
  let service: HealthService;
  let pool: { query: jest.Mock; end: jest.Mock };

  beforeEach(async () => {
    pool = {
      query: jest.fn(),
      end: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: Pool,
          useValue: pool,
        },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('reports the database as healthy when SELECT 1 succeeds', async () => {
    pool.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'ok',
    });
    expect(pool.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('returns service unavailable when the database query fails', async () => {
    pool.query.mockRejectedValue(new Error('database connection failed'));

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('closes the database pool during module shutdown', async () => {
    await service.onModuleDestroy();

    expect(pool.end).toHaveBeenCalled();
  });
});
