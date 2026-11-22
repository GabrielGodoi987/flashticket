import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSectors1795000000004 implements MigrationInterface {
  name = 'CreateSectors1795000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sectors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "show_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sectors" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sectors_show_name" UNIQUE ("show_id", "name"),
        CONSTRAINT "FK_sectors_show_id" FOREIGN KEY ("show_id")
          REFERENCES "shows"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sectors"`);
  }
}
