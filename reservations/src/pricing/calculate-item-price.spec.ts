import { PriceModality } from '../common/enums/price-modality.enum';
import { calculateItemPrice } from './calculate-item-price';

describe('calculateItemPrice', () => {
  it('inteira: devolve o preço cheio', () => {
    expect(calculateItemPrice(10000, PriceModality.INTEIRA)).toBe(10000);
  });

  it('meia: devolve metade do preço', () => {
    expect(calculateItemPrice(10000, PriceModality.MEIA)).toBe(5000);
  });

  it('meia: arredonda para baixo quando ímpar', () => {
    expect(calculateItemPrice(10001, PriceModality.MEIA)).toBe(5000);
  });

  it('meia: preço zero continua zero', () => {
    expect(calculateItemPrice(0, PriceModality.MEIA)).toBe(0);
  });

  it.each([-1, 10.5, NaN])(
    'rejeita preço inválido %p com RangeError',
    (priceInCents) => {
      expect(() =>
        calculateItemPrice(priceInCents, PriceModality.INTEIRA),
      ).toThrow(RangeError);
    },
  );
});
