import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ShowStatus } from '../../common/enums/show-status.enum';
import { ShowCategory } from './show-category.entity';

@Entity('shows')
@Index('IDX_shows_category_id', ['categoryId'])
@Check('CHK_shows_period', '(end_at > start_at)')
@Check(
  'CHK_shows_max_tickets_per_reservation',
  '(max_tickets_per_reservation > 0)',
)
export class Show extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 200 })
  venue: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({
    type: 'enum',
    enum: ShowStatus,
    enumName: 'show_status',
    default: ShowStatus.DRAFT,
  })
  status: ShowStatus;

  @Column({ name: 'max_tickets_per_reservation', type: 'int', default: 6 })
  maxTicketsPerReservation: number;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => ShowCategory, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'FK_shows_category_id',
  })
  category: Relation<ShowCategory>;

  // Sem FK: o dono do usuário é o serviço IAM.
  @Column({ name: 'producer_id', type: 'uuid' })
  producerId: string;
}
