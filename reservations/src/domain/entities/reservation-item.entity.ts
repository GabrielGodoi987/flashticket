import type { Relation } from 'typeorm';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { PriceModality } from '../enums/price-modality.enum';
import { BaseEntity } from './base.entity';
import { Reservation } from './reservation.entity';
import { Seat } from './seat.entity';
import { TicketType } from './ticket-type.entity';

@Entity('reservation_items')
@Unique('UQ_reservation_items_reservation_seat', ['reservationId', 'seatId'])
@Check('CHK_reservation_items_price', '(price_in_cents >= 0)')
export class ReservationItem extends BaseEntity {
  @Column({ name: 'reservation_id', type: 'uuid' })
  reservationId!: string;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'reservation_id',
    foreignKeyConstraintName: 'FK_reservation_items_reservation_id',
  })
  reservation!: Relation<Reservation>;

  @Index('IDX_reservation_items_seat_id')
  @Column({ name: 'seat_id', type: 'uuid' })
  seatId!: string;

  @ManyToOne(() => Seat, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'seat_id',
    foreignKeyConstraintName: 'FK_reservation_items_seat_id',
  })
  seat!: Relation<Seat>;

  @Column({ name: 'ticket_type_id', type: 'uuid' })
  ticketTypeId!: string;

  @ManyToOne(() => TicketType, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'ticket_type_id',
    foreignKeyConstraintName: 'FK_reservation_items_ticket_type_id',
  })
  ticketType!: Relation<TicketType>;

  @Column({
    name: 'price_modality',
    type: 'enum',
    enum: PriceModality,
    enumName: 'price_modality',
  })
  priceModality!: PriceModality;

  @Column({ name: 'price_in_cents', type: 'int' })
  priceInCents!: number;

  @Column({ name: 'holder_name', type: 'varchar', length: 200 })
  holderName!: string;

  @Column({ name: 'holder_document', type: 'varchar', length: 20 })
  holderDocument!: string;

  // TypeORM mapeia `date` para string 'YYYY-MM-DD'.
  @Column({ name: 'holder_birth_date', type: 'date' })
  holderBirthDate!: string;
}
