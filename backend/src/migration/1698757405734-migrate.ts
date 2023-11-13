import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1698757405734 implements MigrationInterface {
    name = 'Migrate1698757405734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_0468c843ad48d3455e48d40ddd4"`);
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "userId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_0468c843ad48d3455e48d40ddd4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
