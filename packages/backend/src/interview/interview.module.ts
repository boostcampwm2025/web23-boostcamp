import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewRepository } from './interview.repository';
import { SttService } from './stt.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([])],
  controllers: [InterviewController],
  providers: [InterviewService, InterviewRepository, SttService],
})
export class InterviewModule {}
