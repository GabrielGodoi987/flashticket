import { Module } from '@nestjs/common';
import { ShowCategoryModule } from './show-category/show-category.module';

@Module({
  imports: [ShowCategoryModule],
})
export class PlatformModule {}
