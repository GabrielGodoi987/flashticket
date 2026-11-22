import { PriceModality } from '../common/enums/price-modality.enum';

// Preço final do item, em centavos. Meia = 50% da inteira, arredondado para
// baixo (a favor do cliente).
export function calculateItemPrice(
  priceInCents: number,
  modality: PriceModality,
): number {
  if (!Number.isInteger(priceInCents) || priceInCents < 0) {
    throw new RangeError('priceInCents deve ser um inteiro >= 0');
  }

  switch (modality) {
    case PriceModality.INTEIRA:
      return priceInCents;
    case PriceModality.MEIA:
      return Math.floor(priceInCents / 2);
  }
}
