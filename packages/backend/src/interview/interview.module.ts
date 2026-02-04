import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewRepository } from './interview.repository';
import { SttService } from './stt.service';
import { QuestionsRepository } from './repositories/questions.repository';
import { AnswersRepository } from './repositories/answers.repository';
import { KeySetStore } from './stores/key-set.store';

import { InterviewAIService } from './interview-ai.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { DocumentModule } from '../document/document.module';
import { InterviewFeedbackService } from './interview-feedback.service';

@Module({
  imports: [UserModule, DocumentModule, TypeOrmModule.forFeature([])],
  controllers: [InterviewController],
  providers: [
    InterviewService,
    InterviewRepository,
    SttService,
    QuestionsRepository,
    AnswersRepository,
    KeySetStore,
    InterviewAIService,
    InterviewFeedbackService,
  ],
})
export class InterviewModule {}
