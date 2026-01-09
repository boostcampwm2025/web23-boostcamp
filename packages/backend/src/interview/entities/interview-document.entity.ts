import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Column,
} from 'typeorm';
import { TechnicalInterview } from './technical-interview.entity';
import { Document } from '../../document/entities/document.entity';

@Entity('interviews_documents')
export class InterviewDocument {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'interviews_documents_id' })
    interviewsDocumentsId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'modified_at' })
    modifiedAt: Date;

    @ManyToOne(() => TechnicalInterview, (tech) => tech.interviewDocuments)
    @JoinColumn({ name: 'technical_interview_id' })
    technicalInterview: TechnicalInterview;

    @ManyToOne(() => Document)
    @JoinColumn({ name: 'documents_id' })
    document: Document;
}
