import { MigrationInterface, QueryRunner } from "typeorm";

export class Changerelation1698786502071 implements MigrationInterface {
    name = 'Changerelation1698786502071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP CONSTRAINT "FK_5bf04e06e0a63386184dabf32db"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP CONSTRAINT "FK_f4bbb0b7bcae7fab6875ac550fb"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP CONSTRAINT "UQ_5bf04e06e0a63386184dabf32db"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP CONSTRAINT "UQ_f4bbb0b7bcae7fab6875ac550fb"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD CONSTRAINT "FK_5bf04e06e0a63386184dabf32db" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD CONSTRAINT "FK_f4bbb0b7bcae7fab6875ac550fb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP CONSTRAINT "FK_f4bbb0b7bcae7fab6875ac550fb"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" DROP CONSTRAINT "FK_5bf04e06e0a63386184dabf32db"`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD CONSTRAINT "UQ_f4bbb0b7bcae7fab6875ac550fb" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD CONSTRAINT "UQ_5bf04e06e0a63386184dabf32db" UNIQUE ("roomId")`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD CONSTRAINT "FK_f4bbb0b7bcae7fab6875ac550fb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_in_room" ADD CONSTRAINT "FK_5bf04e06e0a63386184dabf32db" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
