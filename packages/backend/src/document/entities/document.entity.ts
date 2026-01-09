import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Portfolio } from './portfolio.entity';
import { CoverLetter } from './cover-letter.entity';

export enum DocumentType {
    COVER = 'COVER',
    PORTFOLIO = 'PORTFOLIO',
}

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'documents_id' })
    documentId: string;

    @Column({ type: 'enum', enum: DocumentType })
    type: DocumentType;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.documents)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToOne(() => Portfolio, (portfolio) => portfolio.document)
    portfolio: Portfolio;

    @OneToOne(() => CoverLetter, (coverLetter) => coverLetter.document)
    coverLetter: CoverLetter;
}
