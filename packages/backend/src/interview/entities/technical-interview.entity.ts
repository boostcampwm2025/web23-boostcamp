import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Interview } from './interview.entity';
import { InterviewDocument } from './interview-document.entity';

@Entity('technical_interviews')
export class TechnicalInterview {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'technical_interviews_id' })
    technicalInterviewId: string;

    @Column({ name: 'video_url', type: 'varchar', length: 255 })
    videoUrl: string;

    @Column({ name: 'feedback_content', type: 'varchar', length: 255 })
    feedbackContent: string;

    @OneToOne(() => Interview, (interview) => interview.technical)
    @JoinColumn({ name: 'interview_id' })
    interview: Interview;

    @OneToMany(() => InterviewDocument, (doc) => doc.technicalInterview)
    interviewDocuments: InterviewDocument[];
}
