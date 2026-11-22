import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './domain/database/data-source';
import { HealthModule } from './health/health.module';
import { PlatformModule } from './platform/platform.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions()),
    PlatformModule,
    HealthModule,
    SharedModule,
  ],
})
export class AppModule {}
