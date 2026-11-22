import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeats1795000000005 implements MigrationInterface {
  name = 'CreateSeats1795000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "seat_status" AS ENUM ('AVAILABLE', 'HELD', 'SOLD')`,
    );
    await queryRunner.query(`
      CREATE TABLE "seats" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sector_id" uuid NOT NULL,
        "row" character varying(10) NOT NULL,
        "number" integer NOT NULL,
        "status" "seat_status" NOT NULL DEFAULT 'AVAILABLE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_seats" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_seats_number" CHECK ("number" > 0),
        CONSTRAINT "UQ_seats_sector_row_number" UNIQUE ("sector_id", "row", "number"),
        CONSTRAINT "FK_seats_sector_id" FOREIGN KEY ("sector_id")
          REFERENCES "sectors"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "seats"`);
    await queryRunner.query(`DROP TYPE "seat_status"`);
  }
}
