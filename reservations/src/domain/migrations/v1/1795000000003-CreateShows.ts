import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShows1795000000003 implements MigrationInterface {
  name = 'CreateShows1795000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "show_status" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED')`,
    );
    await queryRunner.query(`
      CREATE TABLE "shows" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(200) NOT NULL,
        "description" text,
        "venue" character varying(200) NOT NULL,
        "start_at" timestamptz NOT NULL,
        "end_at" timestamptz NOT NULL,
        "status" "show_status" NOT NULL DEFAULT 'DRAFT',
        "max_tickets_per_reservation" integer NOT NULL DEFAULT 6,
        "category_id" uuid NOT NULL,
        "producer_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shows" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_shows_period" CHECK ("end_at" > "start_at"),
        CONSTRAINT "CHK_shows_max_tickets_per_reservation" CHECK ("max_tickets_per_reservation" > 0),
        CONSTRAINT "FK_shows_category_id" FOREIGN KEY ("category_id")
          REFERENCES "show_categories"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_shows_category_id" ON "shows" ("category_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_shows_category_id"`);
    await queryRunner.query(`DROP TABLE "shows"`);
    await queryRunner.query(`DROP TYPE "show_status"`);
  }
}
