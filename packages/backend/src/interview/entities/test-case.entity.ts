import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Problem } from './problem.entity';

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'test_case_id' })
  testCaseId: string;

  @Column({ type: 'varchar', length: 255 })
  input: string;

  @Column({ type: 'varchar', length: 255 })
  output: string;

  @ManyToOne(() => Problem, (problem) => problem.testCases)
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;
}
