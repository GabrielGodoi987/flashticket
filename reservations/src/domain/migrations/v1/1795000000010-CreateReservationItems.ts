import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReservationItems1795000000010 implements MigrationInterface {
  name = 'CreateReservationItems1795000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "price_modality" AS ENUM ('INTEIRA', 'MEIA')`,
    );
    await queryRunner.query(`
      CREATE TABLE "reservation_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "reservation_id" uuid NOT NULL,
        "seat_id" uuid NOT NULL,
        "ticket_type_id" uuid NOT NULL,
        "price_modality" "price_modality" NOT NULL,
        "price_in_cents" integer NOT NULL,
        "holder_name" character varying(200) NOT NULL,
        "holder_document" character varying(20) NOT NULL,
        "holder_birth_date" date NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reservation_items" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_reservation_items_price" CHECK ("price_in_cents" >= 0),
        CONSTRAINT "UQ_reservation_items_reservation_seat" UNIQUE ("reservation_id", "seat_id"),
        CONSTRAINT "FK_reservation_items_reservation_id" FOREIGN KEY ("reservation_id")
          REFERENCES "reservations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reservation_items_seat_id" FOREIGN KEY ("seat_id")
          REFERENCES "seats"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_reservation_items_ticket_type_id" FOREIGN KEY ("ticket_type_id")
          REFERENCES "ticket_types"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_reservation_items_seat_id" ON "reservation_items" ("seat_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_reservation_items_seat_id"`);
    await queryRunner.query(`DROP TABLE "reservation_items"`);
    await queryRunner.query(`DROP TYPE "price_modality"`);
  }
}
