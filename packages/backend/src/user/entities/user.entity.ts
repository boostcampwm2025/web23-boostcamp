import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Interview } from '../../interview/entities/interview.entity';
import { Document } from '../../document/entities/document.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'user_id' })
  userId: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255 })
  userEmail: string;

  @Column({ name: 'profile_url', type: 'varchar', length: 255, nullable: true })
  profileUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;

  @OneToMany(() => Interview, (interview) => interview.user)
  interviews: Interview[];

  @OneToMany(() => Document, (document) => document.user)
  documents: Document[];
}
