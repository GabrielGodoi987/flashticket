import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { PriceModality } from '../../domain/enums/price-modality.enum';

@Injectable()
export class ItemPriceCalculator {
  calculatePrice(priceInCents: number, modality: PriceModality): number {
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
}
