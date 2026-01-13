import { Injectable } from '@nestjs/common';
import { InterviewRepository } from './interview.repository';
import { Interview } from './entities/interview.entity';
import { NotFoundException } from '@nestjs/common';
import { SttService } from './stt.service';
import { InterviewAnswer } from './entities/interview-answer.entity';

@Injectable()
export class InterviewService {
  constructor(
    private readonly interviewRepository: InterviewRepository,
    private readonly sttService: SttService,
  ) {}

  async answer(
    userId: string,
    interviewId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const interview = await this.findExistingInterview(interviewId, [
      'answers',
      'user',
    ]);
    interview.validateUser(userId);
    const sttResult = await this.sttService.transform(file);

    // interview의 cascade를 활용해 answer 엔티티를 삽입한다.
    const answer = new InterviewAnswer(sttResult);
    interview.answers.push(answer);
    await this.interviewRepository.save(interview);
    return sttResult;
  }

  async findExistingInterview(
    interviewId: string,
    relations: string[] = [],
  ): Promise<Interview> {
    const interview = await this.interviewRepository.findById(
      interviewId,
      relations,
    );
    if (!interview) {
      throw new NotFoundException('존재하지않는 인터뷰입니다.');
    }
    return interview;
  }
}
