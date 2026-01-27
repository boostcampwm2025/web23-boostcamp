import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export async function seedDatabase(dataSource: DataSource) {
  const seedSqlPath = path.join(__dirname, '../../test_data_clean.sql');
  if (!fs.existsSync(seedSqlPath)) {
    console.warn('Seed SQL file not found at:', seedSqlPath);
    return;
  }

  const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
  const queries = seedSql.split(';').filter((q) => q.trim().length > 0);

  // Disable FK checks to allow truncation
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  
  const tables = [
    'interviews_documents',
    'technical_interviews',
    'interviews',
    'ai_persona',
    'cover_letters_question_answer',
    'cover_letters',
    'portfolios',
    'documents',
    'users'
  ];

  for (const table of tables) {
    try {
      await dataSource.query(`TRUNCATE TABLE ${table}`);
    } catch (e) {
      console.warn(`Failed to truncate table ${table}:`, e.message);
    }
  }

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

  for (const query of queries) {
    await dataSource.query(query);
  }
}
