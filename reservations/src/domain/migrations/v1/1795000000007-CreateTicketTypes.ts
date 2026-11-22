import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketTypes1795000000007 implements MigrationInterface {
  name = 'CreateTicketTypes1795000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ticket_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "show_id" uuid NOT NULL,
        "sector_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "price_in_cents" integer NOT NULL,
        "quantity" integer,
        "reserved_count" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ticket_types_show_name" UNIQUE ("show_id", "name"),
        CONSTRAINT "CHK_ticket_types_price" CHECK ("price_in_cents" >= 0),
        CONSTRAINT "CHK_ticket_types_quota" CHECK (
          "reserved_count" >= 0
          AND ("quantity" IS NULL OR "reserved_count" <= "quantity")
        ),
        CONSTRAINT "FK_ticket_types_show_id" FOREIGN KEY ("show_id")
          REFERENCES "shows"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_types_sector_id" FOREIGN KEY ("sector_id")
          REFERENCES "sectors"("id") ON DELETE RESTRICT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ticket_types"`);
  }
}
