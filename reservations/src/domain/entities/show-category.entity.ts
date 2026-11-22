import { Check, Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('show_categories')
@Check('CHK_show_categories_min_age', '((min_age IS NULL) OR (min_age >= 0))')
export class ShowCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'min_age', type: 'int', nullable: true })
  minAge!: number | null;

  // Sem FK: o dono do usuário é o serviço IAM.
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;
}
