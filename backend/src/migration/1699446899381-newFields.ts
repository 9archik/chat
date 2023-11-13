import { MigrationInterface, QueryRunner } from "typeorm";

export class NewFields1699446899381 implements MigrationInterface {
    name = 'NewFields1699446899381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD "leave" boolean`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD "kick" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP COLUMN "kick"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP COLUMN "leave"`);
    }

}
