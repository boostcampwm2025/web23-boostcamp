import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QuestionsRepository } from './repositories/questions.repository';
import { AnswersRepository } from './repositories/answers.repository';
import { InterviewQuestion } from './entities/interview-question.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';
import { KeySetStore } from './stores/key-set.store';
import { InterviewAIService } from './interview-ai.service';
import { SttService } from './stt.service';
import { InterviewRepository } from './interview.repository';
import { Interview } from './entities/interview.entity';
import { PortfolioRepository } from '../document/repositories/portfolio.repository';
import { CoverLetterRepository } from '../document/repositories/cover-letter.repository';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private readonly interviewRepository: InterviewRepository,
    private readonly sttService: SttService,
    private readonly questionRepository: QuestionsRepository,
    private readonly answerRepository: AnswersRepository,
    private readonly keySetStore: KeySetStore,
    private readonly interviewAIService: InterviewAIService,
    private readonly portfolioRepository: PortfolioRepository,
    private readonly coverLetterRepository: CoverLetterRepository,
  ) {}

  async answerWithVoice(
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

  async answerWithChat(
    userId: string,
    interviewId: string,
    answerText: string,
  ): Promise<string> {
    const interview = await this.findExistingInterview(interviewId, [
      'answers',
      'user',
    ]);
    interview.validateUser(userId);

    const answer = new InterviewAnswer(answerText);
    interview.answers.push(answer);
    await this.interviewRepository.save(interview);
    return answerText;
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

  async chatInterviewer(interviewId: string) {
    const questions: InterviewQuestion[] =
      await this.questionRepository.findFiveByInterviewId(interviewId);
    const answers: InterviewAnswer[] =
      await this.answerRepository.findFiveByInterviewId(interviewId);

    this.logger.log('questions:', JSON.stringify(questions, null, 2));
    this.logger.log('answers:', JSON.stringify(answers, null, 2));

    const documentsKey = `documents:${interviewId}`;

    // 테스트를 위한 하드 코딩
    this.keySetStore.addToSet(documentsKey, 'PORTFOLIO:1');

    const documentIds = this.keySetStore.getSet(documentsKey);

    const portfolioContents: string[] = [];
    const coverLetterContents: string[] = [];

    for (const item of documentIds) {
      const [type, id] = item.split(':');
      if (type === 'PORTFOLIO') {
        const portfolio = await this.portfolioRepository.findByDocumentId(id);
        if (portfolio) portfolioContents.push(portfolio.content);
      }

      if (type === 'COVER') {
        const coverLetter =
          await this.coverLetterRepository.findByDocumentId(id);
        if (coverLetter && coverLetter.questionAnswers) {
          const content = coverLetter.questionAnswers
            .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
            .join('\n\n');
          coverLetterContents.push(content);
        }
      }
    }

    const userinfo = `[PORTFOLIO]\n${portfolioContents.join('\n\n')}\n\n[COVER LETTER]\n${coverLetterContents.join('\n\n')}`;

    const visitedTopicsKey = `visitedTopics:${interviewId}`;

    const visitedTopics = this.keySetStore.getSet(visitedTopicsKey);

    this.logger.log('visitedTopics:', visitedTopics);

    const parsed = await this.interviewAIService.generateInterviewQuestion(
      questions,
      answers,
      userinfo,
      visitedTopics,
    );

    if (parsed) {
      if (parsed.tags && Array.isArray(parsed.tags)) {
        parsed.tags.forEach((tag: string) =>
          this.keySetStore.addToSet(visitedTopicsKey, tag),
        );
      }

      const savedQuestion = await this.questionRepository.createQuestion(
        JSON.stringify(parsed),
        interviewId,
      );

      return {
        questionId: savedQuestion.questionId,
        question: parsed.question,
        createdAt: savedQuestion.createdAt,
        isLast: parsed.isLast,
      };
    }

    throw new InternalServerErrorException('Failed to parse JSON response');
  }
}
