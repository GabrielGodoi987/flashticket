import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShowCategories1795000000001 implements MigrationInterface {
  name = 'CreateShowCategories1795000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE "show_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "min_age" integer,
        "created_by" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_show_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_show_categories_name" UNIQUE ("name"),
        CONSTRAINT "CHK_show_categories_min_age" CHECK ("min_age" IS NULL OR "min_age" >= 0)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "show_categories"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto"`);
  }
}
