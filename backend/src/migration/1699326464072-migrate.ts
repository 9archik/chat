import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1699326464072 implements MigrationInterface {
    name = 'Migrate1699326464072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" ADD "userInRoomId" integer`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_02e4cd7d5078697d77a125fcb49" FOREIGN KEY ("userInRoomId") REFERENCES "users_in_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_02e4cd7d5078697d77a125fcb49"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "userInRoomId"`);
    }

}
