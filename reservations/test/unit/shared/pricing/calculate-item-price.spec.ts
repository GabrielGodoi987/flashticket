import { PriceModality } from '../../../../src/domain/enums/price-modality.enum';
import { ItemPriceCalculator } from '../../../../src/shared/pricing/calculate-item-price';

describe('ItemPriceCalculator', () => {
  let calculator: ItemPriceCalculator;

  beforeEach(() => {
    calculator = new ItemPriceCalculator();
  });

  it('inteira: devolve o preço cheio', () => {
    expect(calculator.calculatePrice(10000, PriceModality.INTEIRA)).toBe(10000);
  });

  it('meia: devolve metade do preço', () => {
    expect(calculator.calculatePrice(10000, PriceModality.MEIA)).toBe(5000);
  });

  it('meia: arredonda para baixo quando ímpar', () => {
    expect(calculator.calculatePrice(10001, PriceModality.MEIA)).toBe(5000);
  });

  it('meia: preço zero continua zero', () => {
    expect(calculator.calculatePrice(0, PriceModality.MEIA)).toBe(0);
  });

  it.each([-1, 10.5, NaN])(
    'rejeita preço inválido %p com RangeError',
    (priceInCents) => {
      expect(() =>
        calculator.calculatePrice(priceInCents, PriceModality.INTEIRA),
      ).toThrow(RangeError);
    },
  );
});
