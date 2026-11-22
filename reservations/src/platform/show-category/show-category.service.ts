import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ShowCategory } from '../../domain/entities/show-category.entity';
import { CreateShowCategoryDto } from './dto/create-show-category.dto';
import { UpdateShowCategoryDto } from './dto/update-show-category.dto';

@Injectable()
export class ShowCategoryService {
  constructor(
    @InjectRepository(ShowCategory)
    private readonly repository: Repository<ShowCategory>,
  ) {}

  async create(
    dto: CreateShowCategoryDto,
    createdBy: string | null,
  ): Promise<ShowCategory> {
    const category = this.repository.create({
      name: dto.name,
      minAge: dto.minAge ?? null,
      createdBy,
    });

    try {
      return await this.repository.save(category);
    } catch (error) {
      throw this.translateUniqueViolation(error, dto.name);
    }
  }

  findAll(): Promise<ShowCategory[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<ShowCategory> {
    const category = await this.repository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, dto: UpdateShowCategoryDto): Promise<ShowCategory> {
    const category = await this.findOne(id);

    if (dto.name !== undefined) {
      category.name = dto.name;
    }

    if (dto.minAge !== undefined) {
      category.minAge = dto.minAge;
    }

    try {
      return await this.repository.save(category);
    } catch (error) {
      throw this.translateUniqueViolation(error, category.name);
    }
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    try {
      await this.repository.remove(category);
    } catch (error) {
      if (this.driverErrorCode(error) === '23503') {
        throw new ConflictException(
          'Categoria está em uso por shows e não pode ser removida',
        );
      }

      throw error;
    }
  }

  private translateUniqueViolation(error: unknown, name: string): unknown {
    if (this.driverErrorCode(error) === '23505') {
      return new ConflictException(
        `Já existe uma categoria com o nome "${name}"`,
      );
    }

    return error;
  }

  private driverErrorCode(error: unknown): string | undefined {
    if (!(error instanceof QueryFailedError)) {
      return undefined;
    }

    const driverError = error.driverError as { code?: string } | undefined;

    return driverError?.code;
  }
}
