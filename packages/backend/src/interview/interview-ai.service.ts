import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SYSTEM_PROMPT } from './interview.constants';
import { InterviewQuestion } from './entities/interview-question.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';

export interface ClovaInterviewResponse {
  question: string;
  tags: string[];
  isLast: boolean;
}

interface ClovaApiResponse {
  result: {
    message: {
      content: string;
    };
  };
}

@Injectable()
export class InterviewAIService {
  private readonly logger = new Logger(InterviewAIService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    const apiUrl = this.configService.get<string>('CLOVA_API_URL');
    const apiKey = this.configService.get<string>('CLOVA_API_KEY');

    if (!apiUrl || !apiKey) {
      throw new InternalServerErrorException(
        'CLOVA_API_URL or CLOVA_API_KEY is not set',
      );
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async generateInterviewQuestion(
    questions: InterviewQuestion[],
    answers: InterviewAnswer[],
    userInfo: string,
    visitedTopics: string[],
    isLastQuestion: boolean,
  ): Promise<ClovaInterviewResponse> {
    const { historyMessages, currentAnswer } = this.createHistoryMessages(
      questions,
      answers,
    );
    const userPrompt = this.constructUserPrompt(
      userInfo,
      visitedTopics,
      currentAnswer,
      isLastQuestion,
    );

    let aiAnswer = await this.fetchAIQuestion(historyMessages, userPrompt);

    let isDuplicated = false;
    if (questions.length > 0) {
      isDuplicated = questions
        .map((q) => q.content)
        .includes(aiAnswer.question);
    }

    this.logger.debug(`${JSON.stringify(historyMessages, null, 2)}`);
    this.logger.debug(`AI question: ${aiAnswer.question}`);
    this.logger.debug(
      `${isDuplicated ? 'Duplicated' : 'Not duplicated'} questions: [${questions.map((q) => q.content).join(', ')}]`,
    );

    if (isDuplicated) {
      const lastUserPrompt = this.constructUserPrompt(
        userInfo,
        visitedTopics,
        currentAnswer,
        true,
      );
      aiAnswer = await this.fetchAIQuestion(historyMessages, lastUserPrompt);
      aiAnswer.isLast = true;
    }

    return aiAnswer;
  }

  private createHistoryMessages(
    questions: InterviewQuestion[],
    answers: InterviewAnswer[],
  ) {
    const historyMessages: { role: string; content: string }[] = [];
    let currentAnswer = '';

    for (let i = 0; i < questions.length; i++) {
      historyMessages.push({
        role: 'assistant',
        content: questions[i].content,
      });
      if (answers[i]) {
        historyMessages.push({ role: 'user', content: answers[i].content });
        currentAnswer = answers[i].content;
      }
    }

    // Fallback checks
    if (answers.length > 0) {
      currentAnswer = answers[answers.length - 1].content;
    }

    return { historyMessages, currentAnswer };
  }

  private constructUserPrompt(
    userInfo: string,
    visitedTopics: string[],
    currentAnswer: string,
    isLastQuestion: boolean,
  ): string {
    const lastQuestPrompt = `
        !!! 종료 모드 (Termination Mode) !!!
        이번 턴이 인터뷰의 마지막 순서입니다.
        지원자의 답변에 대한 간단한 마무리 인사를 건네고 인터뷰를 종료하십시오.
        더 이상의 질문을 생성하지 마십시오.
        반드시 JSON 응답의 "isLast" 필드를 true로 설정하십시오.
    `;

    return `
            ***[컨텍스트: 이력서 및 포트폴리오]***
            ${userInfo}
            
            ***[제외된 주제 (질문 금지)]***
            이미 대화한 다음 주제들에 대해서는 절대 중복하여 질문하지 마십시오:
            [${visitedTopics.join(', ')}]
            
            ***[컨텍스트: 현재 입력]***
            - 직전 지원자 답변: ${currentAnswer || '없음 (첫 질문)'}

            !!! 반드시 시스템 프롬프트에 정의된 JSON 형식으로만 답변하십시오. !!!
            Format: { "question": "...", "tags": [...], "isLast": boolean }
        
            ${isLastQuestion ? lastQuestPrompt : ''}
        `;
  }

  private async fetchAIQuestion(
    historyMessages: { role: string; content: string }[],
    userPrompt: string,
  ): Promise<ClovaInterviewResponse> {
    const maxRetries = 1;
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const systemPrompt = SYSTEM_PROMPT;

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              ...historyMessages,
              {
                role: 'user',
                content: userPrompt,
              },
            ],
            thinking: { effort: 'none' },
            topP: 0.1,
            topK: 0,
            maxCompletionTokens: 1024,
            temperature: 0.4,
            repeatPenalty: 1.1,
            seed: 0,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new InternalServerErrorException(
            `Clova API Error: ${response.status} - ${errorText}`,
          );
        }

        const data = (await response.json()) as ClovaApiResponse;

        this.logger.log('Clova API response:', JSON.stringify(data, null, 2));

        const content: string = data.result?.message?.content;
        if (!content)
          throw new InternalServerErrorException('Empty response from Clova');

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch
          ? (JSON.parse(jsonMatch[0]) as ClovaInterviewResponse)
          : null;

        if (!parsed)
          throw new InternalServerErrorException('Invalid JSON response');

        return parsed;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        this.logger.warn(`Attempt ${attempt + 1} failed: ${error}`);
        attempt++;
        if (attempt <= maxRetries) {
          this.logger.log(`Retrying... (${attempt}/${maxRetries})`);
        }
      }
    }

    if (lastError instanceof Error && lastError.name === 'AbortError') {
      this.logger.error('Clova API request timed out');
      throw new InternalServerErrorException('Clova API request timed out');
    }

    this.logger.error('Error fetching AI question after retries:', lastError);
    if (lastError instanceof Error) {
      this.logger.error(lastError.stack);
    }

    throw new InternalServerErrorException(
      lastError instanceof Error
        ? lastError.message
        : `Unknown error: ${JSON.stringify(lastError)}`,
    );
  }
}
