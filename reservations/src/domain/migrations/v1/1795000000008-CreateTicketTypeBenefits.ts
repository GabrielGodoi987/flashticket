import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketTypeBenefits1795000000008 implements MigrationInterface {
  name = 'CreateTicketTypeBenefits1795000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ticket_type_benefits" (
        "ticket_type_id" uuid NOT NULL,
        "benefit_id" uuid NOT NULL,
        CONSTRAINT "PK_ticket_type_benefits" PRIMARY KEY ("ticket_type_id", "benefit_id"),
        CONSTRAINT "FK_ticket_type_benefits_ticket_type_id" FOREIGN KEY ("ticket_type_id")
          REFERENCES "ticket_types"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_ticket_type_benefits_benefit_id" FOREIGN KEY ("benefit_id")
          REFERENCES "benefits"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_ticket_type_benefits_ticket_type_id" ON "ticket_type_benefits" ("ticket_type_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ticket_type_benefits_benefit_id" ON "ticket_type_benefits" ("benefit_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ticket_type_benefits"`);
  }
}
