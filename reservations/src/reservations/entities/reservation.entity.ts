import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';
import { Show } from '../../catalog/entities/show.entity';
import { ReservationItem } from './reservation-item.entity';

@Entity('reservations')
@Index('IDX_reservations_status_expires_at', ['status', 'expiresAt'])
@Index('IDX_reservations_buyer_id', ['buyerId'])
@Check(
  'CHK_reservations_amounts',
  '((discount_in_cents >= 0) AND (total_in_cents >= 0))',
)
export class Reservation extends BaseEntity {
  @Column({ name: 'show_id', type: 'uuid' })
  showId: string;

  @ManyToOne(() => Show, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'show_id',
    foreignKeyConstraintName: 'FK_reservations_show_id',
  })
  show: Relation<Show>;

  // Sem FK: o dono do usuário é o serviço IAM.
  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ name: 'buyer_name', type: 'varchar', length: 200 })
  buyerName: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    enumName: 'reservation_status',
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'discount_in_cents', type: 'int', default: 0 })
  discountInCents: number;

  // Gancho para o Coupon da v2; sem FK por enquanto.
  @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
  couponId: string | null;

  @Column({ name: 'total_in_cents', type: 'int' })
  totalInCents: number;

  @OneToMany(() => ReservationItem, (item) => item.reservation, {
    cascade: ['insert'],
  })
  items: Relation<ReservationItem>[];
}
