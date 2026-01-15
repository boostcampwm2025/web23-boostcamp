
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    this.logger.log('Starting seed process...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('Clearing existing data...');
      this.logger.log('Executing raw SQL seeds...');
      
      // SQL 파일 읽기
      // npm run start 실행 시 CWD(현재 작업 디렉토리)가 packages/backend라고 가정
      const seedFilePath = path.join(process.cwd(), 'db', 'seeds.sql');
      const sql = fs.readFileSync(seedFilePath, 'utf8');

      // 세미콜론(;)으로 단순 분리 시 내용에 세미콜론이 포함되어 있으면 깨질 수 있음
      // 하지만 제공된 SQL은 문장 끝에 표준 세미콜론을 사용함
      // 더 나은 방법: 드라이버가 허용한다면 전체 유효 SQL 블록을 실행하거나,
      // 주의해서 분리해야 함.
      // typeorm query runner는 연결 설정에 'multipleStatements: true'가 없으면 한 번 호출로 여러 문장을 처리하지 못할 수 있음
      // ';/n' 등으로 분리하거나, 단순히 ';'로 분리하고 빈 문자열 필터링 시도
      // 텍스트 내용(INSERT 값)에 세미콜론이 있을 수 있음.
      // 하지만 사용자 텍스트 블록에는 문장 내 세미콜론이 없고 주로 구두점만 있는 것으로 보임.
      // 완벽한 분리는 어렵지만, 여기서는 특정 문장 종결 패턴 `);`을 매칭하거나 드라이버 기능을 사용해야 함.
      // multipleStatements가 활성화되지 않았다면 분리해야 함.
      // 표준적인 `;\n` 또는 `;\r\n` 또는 줄 끝의 `;`로 분리 가정.
      // 제공된 SQL은 줄 끝에 `VALUES (...);` 형태를 띰.
      
      const statements = sql
        .split(/;\s*[\r\n]+/) // 세미콜론과 그 뒤의 개행 문자로 분리
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await queryRunner.query(statement);
      }

      await queryRunner.commitTransaction();
      this.logger.log('Seeding complete!');
    } catch (err) {
      this.logger.error('Seeding failed', err);
      // rollback은 트랜잭션이 이미 커밋되었거나 깨진 경우 실패할 수 있음
      if (queryRunner.isTransactionActive) {
         await queryRunner.rollbackTransaction();
      }
      // 시작 시 "자동 실행 모드"라면 프로세스를 종료하고 싶지 않을 수 있음
      // 하지만 검증 단계에서는 실패 여부를 알아야 함.
      // Main.ts에서 에러를 잡고 로그를 남기며, 진행 여부를 확인함.
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
