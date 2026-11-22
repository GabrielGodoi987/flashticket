import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ShowCategory } from '../../catalog/entities/show-category.entity';
import { CreateShowCategoryDto } from './dto/create-show-category.dto';
import { UpdateShowCategoryDto } from './dto/update-show-category.dto';
import { ShowCategoryService } from './show-category.service';

@Controller('show-category')
export class ShowCategoryController {
  constructor(private readonly service: ShowCategoryService) {}

  @Post()
  create(@Body() dto: CreateShowCategoryDto): Promise<ShowCategory> {
    // TODO(auth): restringir a root via guard e usar o id do usuário
    // autenticado no lugar de null.
    return this.service.create(dto, null);
  }

  @Get()
  findAll(): Promise<ShowCategory[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ShowCategory> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShowCategoryDto,
  ): Promise<ShowCategory> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
