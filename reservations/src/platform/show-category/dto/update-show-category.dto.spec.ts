import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateShowCategoryDto } from './update-show-category.dto';

function validateUpdate(payload: Record<string, unknown>) {
  return validate(plainToInstance(UpdateShowCategoryDto, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('UpdateShowCategoryDto', () => {
  it('aceita objeto vazio', async () => {
    await expect(validateUpdate({})).resolves.toHaveLength(0);
  });

  it('aceita minAge null', async () => {
    await expect(validateUpdate({ minAge: null })).resolves.toHaveLength(0);
  });

  it('rejeita name null', async () => {
    const errors = await validateUpdate({ name: null });

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it('rejeita name só com espaços', async () => {
    const errors = await validateUpdate({ name: '   ' });

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });
});
