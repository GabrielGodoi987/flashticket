import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { SeatStatus } from '../../common/enums/seat-status.enum';
import { Sector } from './sector.entity';

@Entity('seats')
@Unique('UQ_seats_sector_row_number', ['sectorId', 'row', 'number'])
@Check('CHK_seats_number', '(number > 0)')
export class Seat extends BaseEntity {
  @Column({ name: 'sector_id', type: 'uuid' })
  sectorId: string;

  @ManyToOne(() => Sector, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'sector_id',
    foreignKeyConstraintName: 'FK_seats_sector_id',
  })
  sector: Relation<Sector>;

  @Column({ type: 'varchar', length: 10 })
  row: string;

  @Column({ type: 'int' })
  number: number;

  @Column({
    type: 'enum',
    enum: SeatStatus,
    enumName: 'seat_status',
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;
}
