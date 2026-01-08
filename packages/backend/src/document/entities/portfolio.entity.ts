import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity('portfolios')
export class Portfolio {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'portfolios_id' })
    portfolioId: string;

    @Column({ name: 'file_url', type: 'varchar', length: 255 })
    fileUrl: string;

    @OneToOne(() => Document, (document) => document.portfolio)
    @JoinColumn({ name: 'documents_id' })
    document: Document;
}
