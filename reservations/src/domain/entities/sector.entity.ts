import type { Relation } from 'typeorm';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Show } from './show.entity';

@Entity('sectors')
@Unique('UQ_sectors_show_name', ['showId', 'name'])
export class Sector extends BaseEntity {
  @Column({ name: 'show_id', type: 'uuid' })
  showId!: string;

  @ManyToOne(() => Show, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'show_id',
    foreignKeyConstraintName: 'FK_sectors_show_id',
  })
  show!: Relation<Show>;

  @Column({ type: 'varchar', length: 100 })
  name!: string;
}
