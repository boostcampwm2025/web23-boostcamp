import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { InterviewQuestion } from './interview-question.entity';

@Entity('ai_persona')
export class AIPersona {
    @PrimaryColumn({ name: 'persona_id', type: 'varchar', length: 255 })
    personaId: string;

    @Column({ type: 'varchar', length: 255 })
    prompt: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    name: string;

    @Column({ name: 'img_url', type: 'varchar', length: 255 })
    imgUrl: string;

    @OneToMany(() => InterviewQuestion, (question) => question.persona)
    questions: InterviewQuestion[];
}
