import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1699197648556 implements MigrationInterface {
    name = 'Migrate1699197648556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_12a69b7a1b0a48634c994c8d9e" ON "users_in_room" ("roomId", "userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_12a69b7a1b0a48634c994c8d9e"`);
    }

}
