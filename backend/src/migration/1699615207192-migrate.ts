import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1699615207192 implements MigrationInterface {
    name = 'Migrate1699615207192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP COLUMN "bannedUntil"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD "bannedUntil" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ALTER COLUMN "leave" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_in_room" ALTER COLUMN "leave" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP COLUMN "bannedUntil"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD "bannedUntil" TIMESTAMP`);
    }

}
