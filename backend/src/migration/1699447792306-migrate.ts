import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1699447792306 implements MigrationInterface {
    name = 'Migrate1699447792306'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_in_room" ALTER COLUMN "leave" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ALTER COLUMN "kick" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ALTER COLUMN "kick" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_in_room" ALTER COLUMN "kick" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ALTER COLUMN "kick" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ALTER COLUMN "leave" DROP DEFAULT`);
    }

}
