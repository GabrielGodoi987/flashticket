import { DefaultNamingStrategy, Table } from 'typeorm';

// Os índices da tabela de junção são criados automaticamente pelo TypeORM,
// então o nome explícito precisa vir da naming strategy para bater com a
// migration e manter `migration:generate` sem drift.
export class AppNamingStrategy extends DefaultNamingStrategy {
  indexName(
    tableOrName: Table | string,
    columnNames: string[],
    where?: string,
  ): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;

    if (
      tableName.endsWith('ticket_type_benefits') &&
      columnNames.length === 1
    ) {
      if (columnNames[0] === 'ticket_type_id') {
        return 'IDX_ticket_type_benefits_ticket_type_id';
      }

      if (columnNames[0] === 'benefit_id') {
        return 'IDX_ticket_type_benefits_benefit_id';
      }
    }

    return super.indexName(tableOrName, columnNames, where);
  }
}
