import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { LiveCodingInterview } from './live-coding-interview.entity';
import { TestCase } from './test-case.entity';

@Entity('problems')
export class Problem {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'problem_id' })
    problemId: string;

    @Column({ type: 'varchar', length: 255 })
    content: string;

    @ManyToOne(
        () => LiveCodingInterview,
        (liveCoding) => liveCoding.problems,
    )
    @JoinColumn({ name: 'live_coding_interviews_id' })
    liveCodingInterview: LiveCodingInterview;

    @OneToMany(() => TestCase, (testCase) => testCase.problem)
    testCases: TestCase[];
}
