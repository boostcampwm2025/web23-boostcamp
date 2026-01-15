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

  @Column({ name: 'content', type: 'text' })
  content: string;

  @OneToOne(() => Document, (document) => document.portfolio)
  @JoinColumn({ name: 'documents_id' })
  document: Document;
}
