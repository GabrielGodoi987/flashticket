import type { Relation } from 'typeorm';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Benefit } from './benefit.entity';
import { Sector } from './sector.entity';
import { Show } from './show.entity';

@Entity('ticket_types')
@Unique('UQ_ticket_types_show_name', ['showId', 'name'])
@Check('CHK_ticket_types_price', '(price_in_cents >= 0)')
@Check(
  'CHK_ticket_types_quota',
  '((reserved_count >= 0) AND ((quantity IS NULL) OR (reserved_count <= quantity)))',
)
export class TicketType extends BaseEntity {
  @Column({ name: 'show_id', type: 'uuid' })
  showId!: string;

  @ManyToOne(() => Show, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'show_id',
    foreignKeyConstraintName: 'FK_ticket_types_show_id',
  })
  show!: Relation<Show>;

  @Column({ name: 'sector_id', type: 'uuid' })
  sectorId!: string;

  @ManyToOne(() => Sector, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'sector_id',
    foreignKeyConstraintName: 'FK_ticket_types_sector_id',
  })
  sector!: Relation<Sector>;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'price_in_cents', type: 'int' })
  priceInCents!: number;

  @Column({ type: 'int', nullable: true })
  quantity!: number | null;

  // Derivado dos itens de reserva, mas mantido de propósito: permite o hold
  // atômico com UPDATE condicional. Um COUNT(*) + INSERT teria race condition.
  @Column({ name: 'reserved_count', type: 'int', default: 0 })
  reservedCount!: number;

  @ManyToMany(() => Benefit)
  @JoinTable({
    name: 'ticket_type_benefits',
    joinColumn: {
      name: 'ticket_type_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_ticket_type_benefits_ticket_type_id',
    },
    inverseJoinColumn: {
      name: 'benefit_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_ticket_type_benefits_benefit_id',
    },
  })
  benefits!: Relation<Benefit>[];
}
