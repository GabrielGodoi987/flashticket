import { ShowCategory } from '../../catalog/entities/show-category.entity';
import { CreateShowCategoryDto } from './dto/create-show-category.dto';
import { UpdateShowCategoryDto } from './dto/update-show-category.dto';
import { ShowCategoryController } from './show-category.controller';
import { ShowCategoryService } from './show-category.service';

type MockService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

describe('ShowCategoryController', () => {
  let service: MockService;
  let controller: ShowCategoryController;

  const category = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'MPB',
  } as ShowCategory;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new ShowCategoryController(
      service as unknown as ShowCategoryService,
    );
  });

  it('create delega com null como autor', async () => {
    const dto: CreateShowCategoryDto = { name: 'MPB' };
    service.create.mockResolvedValue(category);

    await expect(controller.create(dto)).resolves.toBe(category);
    expect(service.create).toHaveBeenCalledWith(dto, null);
  });

  it('findAll delega', async () => {
    service.findAll.mockResolvedValue([category]);

    await expect(controller.findAll()).resolves.toEqual([category]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne repassa o id', async () => {
    service.findOne.mockResolvedValue(category);

    await expect(controller.findOne(category.id)).resolves.toBe(category);
    expect(service.findOne).toHaveBeenCalledWith(category.id);
  });

  it('update repassa id e payload', async () => {
    const dto: UpdateShowCategoryDto = { name: 'Funk' };
    service.update.mockResolvedValue(category);

    await expect(controller.update(category.id, dto)).resolves.toBe(category);
    expect(service.update).toHaveBeenCalledWith(category.id, dto);
  });

  it('remove repassa o id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove(category.id);

    expect(service.remove).toHaveBeenCalledWith(category.id);
  });
});
