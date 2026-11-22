import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReservations1795000000009 implements MigrationInterface {
  name = 'CreateReservations1795000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "reservation_status" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED')`,
    );
    await queryRunner.query(`
      CREATE TABLE "reservations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "show_id" uuid NOT NULL,
        "buyer_id" uuid NOT NULL,
        "buyer_name" character varying(200) NOT NULL,
        "status" "reservation_status" NOT NULL DEFAULT 'PENDING',
        "expires_at" timestamptz NOT NULL,
        "discount_in_cents" integer NOT NULL DEFAULT 0,
        "coupon_id" uuid,
        "total_in_cents" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reservations" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_reservations_amounts" CHECK (
          "discount_in_cents" >= 0 AND "total_in_cents" >= 0
        ),
        CONSTRAINT "FK_reservations_show_id" FOREIGN KEY ("show_id")
          REFERENCES "shows"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_reservations_status_expires_at" ON "reservations" ("status", "expires_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reservations_buyer_id" ON "reservations" ("buyer_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_reservations_buyer_id"`);
    await queryRunner.query(`DROP INDEX "IDX_reservations_status_expires_at"`);
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TYPE "reservation_status"`);
  }
}
