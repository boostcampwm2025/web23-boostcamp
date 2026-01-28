import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  MAX_INTERVIEW_TIME_MS,
  MAX_INTERVIEW_TURNS,
} from './interview.constants';
import { QuestionsRepository } from './repositories/questions.repository';
import { AnswersRepository } from './repositories/answers.repository';
import { InterviewQuestion } from './entities/interview-question.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';
import { KeySetStore } from './stores/key-set.store';
import { InterviewAIService } from './interview-ai.service';
import { SttService } from './stt.service';
import { InterviewRepository } from './interview.repository';
import {
  Interview,
  InterviewType,
  LikeStatus,
} from './entities/interview.entity';
import { InterviewChatHistoryResponse } from './dto/interview-chat-history-response.dto';
import { InterviewDuringTimeResponse } from './dto/interview-during-time-response.dto';
import { PortfolioRepository } from '../document/repositories/portfolio.repository';
import { CoverLetterRepository } from '../document/repositories/cover-letter.repository';
import { CreateInterviewResponseDto } from './dto/create-interview-response.dto';
import { CreateInterviewRequestDto } from './dto/create-interview-request.dto';
import { DocumentRepository } from '../document/repositories/document.repository';
import { InterviewFeedbackService } from './interview-feedback.service';
import { InterviewFeedbackResponse } from './dto/interview-feedback-response.dto';
import { InterviewSummaryListResponse } from './dto/interview-summary.response.dto';
import { SortType } from './dto/interview-summary.request.dto';
import { In } from 'typeorm';
import { UserService } from '../user/user.service';

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
    private readonly documentRepository: DocumentRepository,
    private readonly interviewFeedBackService: InterviewFeedbackService,
    private readonly userService: UserService,
  ) {}

  async calculateInterviewTime(
    userId: string,
    interviewId: string,
    endTime: Date,
  ): Promise<void> {
    const interview = await this.findExistingInterview(interviewId, ['user']);
    interview.validateUser(userId);
    interview.calculateDuringTime(endTime);

    await this.interviewRepository.save(interview);
  }

  async getInterviewTime(
    userId: string,
    interviewId: string,
  ): Promise<InterviewDuringTimeResponse> {
    const interview = await this.findExistingInterview(interviewId, ['user']);
    interview.validateUser(userId);

    if (!interview.duringTime) {
      throw new NotFoundException('인터뷰가 아직 종료되지 않았습니다.');
    }

    return {
      createdAt: interview.createdAt,
      duringTime: interview.duringTime,
    };
  }

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

    if (!sttResult) {
      this.logger.warn(
        `음성 파일을 STT 변환 했지만 빈 텍스트입니다. interviewId=${interviewId}`,
      );
      throw new BadRequestException('음성 파일 내용이 비어있습니다.');
    }

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

  async createInterviewFeedback(
    userId: string,
    interviewId: string,
  ): Promise<InterviewFeedbackResponse> {
    const interview = await this.findExistingInterview(interviewId, [
      'answers',
      'user',
      'questions',
    ]);
    interview.validateUser(userId);

    const feedbackDto =
      await this.interviewFeedBackService.requestTechInterviewFeedBack(
        interview.questions,
        interview.answers,
      );

    interview.score = feedbackDto.score;
    interview.feedback = feedbackDto.feedback;
    await this.interviewRepository.save(interview);
    return feedbackDto;
  }

  async createTechInterview(
    userId: string,
    dto: CreateInterviewRequestDto,
  ): Promise<CreateInterviewResponseDto> {
    const user = await this.userService.findExistingUser(userId);

    const documents = await this.documentRepository.find({
      where: {
        documentId: In(dto.documentIds),
        user: { userId },
      },
    });

    if (documents.length !== dto.documentIds.length) {
      this.logger.warn(`잘못된 문서 선택: ${dto.documentIds.toString()}`);
      throw new BadRequestException(`잘못된 문서가 포함되어있습니다.`);
    }

    // 1. Interview 엔티티 생성
    const interview = new Interview();
    interview.title = dto.simulationTitle;
    interview.type = InterviewType.TECH;
    interview.likeStatus = LikeStatus.NONE;
    interview.user = user;

    const savedInterview = await this.interviewRepository.save(interview);

    // 2. 초기 데이터 (Portfolio/CoverLetter 등) 준비 및 Redis(KeySetStore) 저장
    // type에 따른 연관관계가 상이하므로, 쿼리를 아끼기위한 캐싱 데이터
    // ex) document 조회 -> type -> portfolio (x), document + type -> portfolio 조회
    const documentsKey = `documents:${savedInterview.interviewId}`;

    documents.forEach((doc) => {
      // DocumentType이 'PORTFOLIO', 'COVER' 등과 일치한다고 가정
      // Redis 저장 포맷: TYPE:ID (예: PORTFOLIO:1)
      this.keySetStore.addToSet(documentsKey, `${doc.type}:${doc.documentId}`);
      this.logger.log(
        `Added document to MemoryStore: ${doc.type}:${doc.documentId}`,
      );
    });

    // 3. 첫 질문 생성
    const firstQuestion = await this.createQuestion(savedInterview.interviewId);

    // 첫 질문 셍성 후 첫 번째 턴 시작
    this.keySetStore.addToNumber(interview.interviewId, 1);

    return {
      interviewId: savedInterview.interviewId,
      questionId: firstQuestion.questionId,
      question: firstQuestion.question,
      createdAt: firstQuestion.createdAt,
    };
  }

  async chatInterviewer(interviewId: string) {
    const isTimeOver = await this.checkInterviewTimeOver(interviewId);
    const currentTurn = this.getCurrentTurn(interviewId);
    const isTurnOver = this.checkInterviewTurnOver(currentTurn);

    let isLastQuestion = false;

    if (isTimeOver) {
      this.logger.log(`Time Over: isTimeOver=${isTimeOver}`);
      isLastQuestion = true;
    }

    if (isTurnOver) {
      this.logger.log(`Turn Over: isTurnOver=${isTurnOver}`);
      isLastQuestion = true;
    }

    const question = await this.createQuestion(interviewId, isLastQuestion);

    question.isLast = isLastQuestion;

    this.keySetStore.addToNumber(interviewId, currentTurn + 1);

    return question;
  }

  private async createQuestion(interviewId: string, isLastQuestion = false) {
    const questions: InterviewQuestion[] =
      await this.questionRepository.findFiveByInterviewId(interviewId);
    const answers: InterviewAnswer[] =
      await this.answerRepository.findFiveByInterviewId(interviewId);

    if (questions.length === 0 && answers.length === 0) {
      this.logger.debug(`첫 질문 생성 (히스토리 없음)`);
      // 첫 질문이므로 에러가 아님. 그대로 진행.
    }

    this.logger.log('questions:', JSON.stringify(questions, null, 2));
    this.logger.log('answers:', JSON.stringify(answers, null, 2));

    const documentsKey = `documents:${interviewId}`;

    const documentIds = this.keySetStore.getSet(documentsKey);

    const portfolioContents: string[] = [];
    const coverLetterContents: string[] = [];

    // TODO: 함수 분리 필요
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
      isLastQuestion,
    );

    const savedQuestion = await this.questionRepository.createQuestion(
      parsed.question,
      interviewId,
    );

    return {
      questionId: savedQuestion.questionId,
      question: parsed.question,
      createdAt: savedQuestion.createdAt,
      isLast: parsed.isLast,
    };
  }

  async findInterviewChatHistory(
    userId: string,
    interviewId: string,
  ): Promise<InterviewChatHistoryResponse> {
    const interview = await this.findExistingInterview(interviewId, [
      'answers',
      'user',
      'questions',
    ]);
    interview.validateUser(userId);
    return InterviewChatHistoryResponse.fromEntity(
      interview.answers,
      interview.questions,
    );
  }

  private async checkInterviewTimeOver(interviewId: string) {
    const interview = await this.interviewRepository.findById(interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    const timeElapsed = Date.now() - interview.createdAt.getTime();
    const isTimeOver = timeElapsed >= MAX_INTERVIEW_TIME_MS;

    if (isTimeOver) {
      this.logger.warn(`Termination Mode Activated: isTimeOver=${isTimeOver}`);
    }
    return isTimeOver;
  }

  private getCurrentTurn(interviewId: string) {
    const currentTurn = this.keySetStore.getNumber(interviewId);
    if (currentTurn === undefined) {
      this.logger.warn(
        `인터뷰 세션을 찾을 수 없습니다. , interviewId=${interviewId}`,
      );
      throw new InternalServerErrorException(`세션이 종료되었습니다.`);
    }
    return currentTurn;
  }

  private checkInterviewTurnOver(currentTurn: number): boolean {
    if (currentTurn >= MAX_INTERVIEW_TURNS) {
      this.logger.log(`Turn Over: currentTurn=${currentTurn}`);
      return true;
    }
    return false;
  }

  async findInterviewFeedback(
    userId: string,
    interviewId: string,
  ): Promise<InterviewFeedbackResponse> {
    const interview = await this.findExistingInterview(interviewId, ['user']);
    interview.validateUser(userId);
    return {
      score: interview.score,
      feedback: interview.feedback,
    };
  }

  async deleteInterview(userId: string, interviewId: string): Promise<void> {
    const interview = await this.findExistingInterview(interviewId, ['user']);
    interview.validateUser(userId);
    await this.interviewRepository.remove(interview);
  }

  async listInterviews(
    userId: string,
    page: number,
    take: number,
    type: InterviewType | undefined,
    sort: SortType,
  ): Promise<InterviewSummaryListResponse> {
    const adjustedPage = Math.max(0, page - 1);
    const [interviews, count] =
      await this.interviewRepository.findInterviewsPage(
        userId,
        adjustedPage,
        take,
        type,
        sort,
      );

    const totalPage = Math.ceil(count / take);

    const interviewList = interviews.map((interview) => {
      return {
        interviewId: interview.interviewId,
        title: interview.title,
        type: interview.type,
        createdAt: interview.createdAt,
        score: interview.score,
      };
    });

    return {
      interviews: interviewList,
      totalPage: totalPage,
    };
  }
}
