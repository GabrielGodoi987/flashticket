import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBenefits1795000000006 implements MigrationInterface {
  name = 'CreateBenefits1795000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "benefits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "show_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_benefits" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_benefits_show_name" UNIQUE ("show_id", "name"),
        CONSTRAINT "FK_benefits_show_id" FOREIGN KEY ("show_id")
          REFERENCES "shows"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "benefits"`);
  }
}
