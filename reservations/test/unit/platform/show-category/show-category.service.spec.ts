import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { ShowCategory } from '../../../../src/domain/entities/show-category.entity';
import { CreateShowCategoryDto } from '../../../../src/platform/show-category/dto/create-show-category.dto';
import { UpdateShowCategoryDto } from '../../../../src/platform/show-category/dto/update-show-category.dto';
import { ShowCategoryService } from '../../../../src/platform/show-category/show-category.service';

type MockRepository = {
  create: jest.Mock<ShowCategory, [DeepPartial<ShowCategory>]>;
  save: jest.Mock<Promise<ShowCategory>, [ShowCategory]>;
  find: jest.Mock<Promise<ShowCategory[]>, [FindManyOptions<ShowCategory>]>;
  findOne: jest.Mock<
    Promise<ShowCategory | null>,
    [FindOneOptions<ShowCategory>]
  >;
  remove: jest.Mock<Promise<ShowCategory>, [ShowCategory]>;
};

function makeQueryError(code: string): QueryFailedError {
  return new QueryFailedError(
    'query',
    [],
    Object.assign(new Error('database error'), { code }),
  );
}

describe('ShowCategoryService', () => {
  let repository: MockRepository;
  let service: ShowCategoryService;

  const category = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'MPB',
    minAge: 16,
    createdBy: null,
  } as ShowCategory;

  beforeEach(() => {
    repository = {
      create: jest.fn<ShowCategory, [DeepPartial<ShowCategory>]>(),
      save: jest.fn<Promise<ShowCategory>, [ShowCategory]>(),
      find: jest.fn<Promise<ShowCategory[]>, [FindManyOptions<ShowCategory>]>(),
      findOne: jest.fn<
        Promise<ShowCategory | null>,
        [FindOneOptions<ShowCategory>]
      >(),
      remove: jest.fn<Promise<ShowCategory>, [ShowCategory]>(),
    };
    service = new ShowCategoryService(
      repository as unknown as Repository<ShowCategory>,
    );
  });

  describe('create', () => {
    it('persiste nome, minAge e autor', async () => {
      repository.create.mockImplementation((input) => input as ShowCategory);
      repository.save.mockImplementation((input) => Promise.resolve(input));

      const dto: CreateShowCategoryDto = { name: 'Sertanejo', minAge: 16 };

      await service.create(dto, 'user-1');

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Sertanejo',
        minAge: 16,
        createdBy: 'user-1',
      });
      expect(repository.save).toHaveBeenCalledWith({
        name: 'Sertanejo',
        minAge: 16,
        createdBy: 'user-1',
      });
    });

    it('transforma minAge omitido em null', async () => {
      repository.create.mockImplementation((input) => input as ShowCategory);
      repository.save.mockImplementation((input) => Promise.resolve(input));

      await service.create({ name: 'MPB' }, null);

      expect(repository.create).toHaveBeenCalledWith({
        name: 'MPB',
        minAge: null,
        createdBy: null,
      });
    });

    it('traduz unique_violation (23505) em Conflict', async () => {
      repository.create.mockImplementation((input) => input as ShowCategory);
      repository.save.mockRejectedValue(makeQueryError('23505'));

      await expect(
        service.create({ name: 'MPB' }, null),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('propaga erros que não são de unicidade', async () => {
      repository.create.mockImplementation((input) => input as ShowCategory);
      const error = new Error('boom');
      repository.save.mockRejectedValue(error);

      await expect(service.create({ name: 'MPB' }, null)).rejects.toBe(error);
    });
  });

  describe('findAll', () => {
    it('ordena por name ASC', async () => {
      repository.find.mockResolvedValue([category]);

      await expect(service.findAll()).resolves.toEqual([category]);
      expect(repository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('retorna a categoria existente', async () => {
      repository.findOne.mockResolvedValue(category);

      await expect(service.findOne(category.id)).resolves.toBe(category);
    });

    it('lança NotFound quando não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(category.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('altera somente os campos enviados', async () => {
      repository.findOne.mockResolvedValue({ ...category });
      repository.save.mockImplementation((input) => Promise.resolve(input));

      const dto: UpdateShowCategoryDto = { name: 'Funk' };
      const updated = await service.update(category.id, dto);

      expect(updated.name).toBe('Funk');
      expect(updated.minAge).toBe(16);
      expect(repository.save).toHaveBeenCalledWith(updated);
    });

    it('minAge null zera a classificação', async () => {
      repository.findOne.mockResolvedValue({ ...category });
      repository.save.mockImplementation((input) => Promise.resolve(input));

      const updated = await service.update(category.id, { minAge: null });

      expect(updated.minAge).toBeNull();
    });

    it('não chama save quando a categoria não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(category.id, { name: 'Funk' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('traduz unique_violation (23505) em Conflict', async () => {
      repository.findOne.mockResolvedValue({ ...category });
      repository.save.mockRejectedValue(makeQueryError('23505'));

      await expect(
        service.update(category.id, { name: 'Funk' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove', () => {
    it('remove a categoria existente', async () => {
      repository.findOne.mockResolvedValue(category);
      repository.remove.mockResolvedValue(category);

      await service.remove(category.id);

      expect(repository.remove).toHaveBeenCalledWith(category);
    });

    it('não chama remove quando a categoria não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(category.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('traduz foreign_key_violation (23503) em Conflict', async () => {
      repository.findOne.mockResolvedValue(category);
      repository.remove.mockRejectedValue(makeQueryError('23503'));

      await expect(service.remove(category.id)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('propaga outros erros do banco', async () => {
      repository.findOne.mockResolvedValue(category);
      const error = makeQueryError('40001');
      repository.remove.mockRejectedValue(error);

      await expect(service.remove(category.id)).rejects.toBe(error);
    });
  });
});
