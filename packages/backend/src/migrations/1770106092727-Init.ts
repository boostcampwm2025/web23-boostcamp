import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1770106092727 implements MigrationInterface {
    name = 'Init1770106092727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cover_letters_question_answer\` DROP COLUMN \`answer\``);
        await queryRunner.query(`ALTER TABLE \`cover_letters_question_answer\` ADD \`answer\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cover_letters_question_answer\` DROP COLUMN \`answer\``);
        await queryRunner.query(`ALTER TABLE \`cover_letters_question_answer\` ADD \`answer\` varchar(255) NOT NULL`);
    }

}
