import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTickets1795000000011 implements MigrationInterface {
  name = 'CreateTickets1795000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "ticket_status" AS ENUM ('VALID', 'USED', 'CANCELLED')`,
    );
    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "reservation_item_id" uuid NOT NULL,
        "code" character varying(64) NOT NULL,
        "status" "ticket_status" NOT NULL DEFAULT 'VALID',
        "used_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tickets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tickets_reservation_item_id" UNIQUE ("reservation_item_id"),
        CONSTRAINT "UQ_tickets_code" UNIQUE ("code"),
        CONSTRAINT "FK_tickets_reservation_item_id" FOREIGN KEY ("reservation_item_id")
          REFERENCES "reservation_items"("id") ON DELETE RESTRICT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TYPE "ticket_status"`);
  }
}
