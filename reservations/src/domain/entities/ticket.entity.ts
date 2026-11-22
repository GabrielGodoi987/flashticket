import type { Relation } from 'typeorm';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { TicketStatus } from '../enums/ticket-status.enum';
import { BaseEntity } from './base.entity';
import { ReservationItem } from './reservation-item.entity';

@Entity('tickets')
export class Ticket extends BaseEntity {
  @Column({ name: 'reservation_item_id', type: 'uuid', unique: true })
  reservationItemId!: string;

  @OneToOne(() => ReservationItem, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'reservation_item_id',
    foreignKeyConstraintName: 'FK_tickets_reservation_item_id',
  })
  reservationItem!: Relation<ReservationItem>;

  @Column({ type: 'varchar', length: 64, unique: true })
  code!: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    enumName: 'ticket_status',
    default: TicketStatus.VALID,
  })
  status!: TicketStatus;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null;
}
