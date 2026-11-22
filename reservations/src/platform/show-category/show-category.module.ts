import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowCategory } from '../../catalog/entities/show-category.entity';
import { ShowCategoryController } from './show-category.controller';
import { ShowCategoryService } from './show-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShowCategory])],
  controllers: [ShowCategoryController],
  providers: [ShowCategoryService],
})
export class ShowCategoryModule {}
