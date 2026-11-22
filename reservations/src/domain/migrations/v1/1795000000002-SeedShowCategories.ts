import { MigrationInterface, QueryRunner } from 'typeorm';

const SHOW_CATEGORIES = ['Sertanejo', 'Gospel', 'Funk', 'Clássico', 'MPB'];

export class SeedShowCategories1795000000002 implements MigrationInterface {
  name = 'SeedShowCategories1795000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "show_categories" ("name")
       SELECT unnest($1::varchar[])
       ON CONFLICT ("name") DO NOTHING`,
      [SHOW_CATEGORIES],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "show_categories"
       WHERE "name" = ANY($1::varchar[]) AND "created_by" IS NULL`,
      [SHOW_CATEGORIES],
    );
  }
}
