import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateShowCategoryDto } from './create-show-category.dto';

function validateCreate(payload: Record<string, unknown>) {
  return validate(plainToInstance(CreateShowCategoryDto, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('CreateShowCategoryDto', () => {
  it('aceita nome e minAge válidos', async () => {
    await expect(
      validateCreate({ name: 'Sertanejo', minAge: 16 }),
    ).resolves.toHaveLength(0);
  });

  it('aceita sem minAge', async () => {
    await expect(validateCreate({ name: 'MPB' })).resolves.toHaveLength(0);
  });

  it('aceita minAge null (categoria livre)', async () => {
    await expect(
      validateCreate({ name: 'Funk', minAge: null }),
    ).resolves.toHaveLength(0);
  });

  it('faz trim do nome', () => {
    const dto = plainToInstance(CreateShowCategoryDto, { name: '  MPB  ' });

    expect(dto.name).toBe('MPB');
  });

  it.each([
    ['ausente', {}],
    ['vazio', { name: '' }],
    ['só espaços', { name: '   ' }],
    ['null', { name: null }],
    ['número', { name: 123 }],
    ['maior que 100 caracteres', { name: 'a'.repeat(101) }],
  ])('rejeita name %s', async (_label, payload) => {
    const errors = await validateCreate(payload);

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it.each([-1, 19, 10.5, '12'])(
    'rejeita minAge inválido %p',
    async (minAge) => {
      const errors = await validateCreate({ name: 'MPB', minAge });

      expect(errors.some((error) => error.property === 'minAge')).toBe(true);
    },
  );

  it('rejeita createdBy no body', async () => {
    const errors = await validateCreate({
      name: 'MPB',
      createdBy: '00000000-0000-0000-0000-000000000000',
    });

    expect(errors.some((error) => error.property === 'createdBy')).toBe(true);
  });
});
