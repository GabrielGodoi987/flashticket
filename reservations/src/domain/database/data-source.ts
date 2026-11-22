import 'dotenv/config';
import { join } from 'node:path';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppNamingStrategy } from './naming.strategy';

export function dataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    namingStrategy: new AppNamingStrategy(),
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'reservations',
    password: process.env.DB_PASSWORD ?? 'reservations',
    database: process.env.DB_NAME ?? 'reservations',
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [
      join(__dirname, '..', 'domain', 'migrations', 'v1', '*.{ts,js}'),
    ],
    migrationsTableName: 'migrations',
    synchronize: false,
    uuidExtension: 'pgcrypto',
  };
}

export const AppDataSource = new DataSource(dataSourceOptions());
