import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { PlatformModule } from './platform/platform.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions()), PlatformModule],
})
export class AppModule {}
