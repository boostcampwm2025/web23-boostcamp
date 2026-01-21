import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InterviewQuestion } from './entities/interview-question.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';
import { ConfigService } from '@nestjs/config';
import { InterviewFeedbackResponse } from './dto/interview-feedback-response.dto';
import { FEEDBACK_SYSTEM_PROMPT } from './interview.constants';

interface ClovaApiResponse {
  result: {
    message: {
      content: string;
    };
  };
}

@Injectable()
export class InterviewFeedbackService {
  private readonly systemPrompt = FEEDBACK_SYSTEM_PROMPT;

  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.getOrThrow('CLOVA_API_KEY');
    this.apiUrl = this.config.getOrThrow('CLOVA_API_URL');
  }

  async requestTechInterviewFeedBack(
    questions: InterviewQuestion[],
    answers: InterviewAnswer[],
  ): Promise<InterviewFeedbackResponse> {
    const userPrompt = this.buildUserPrompt(questions, answers);
    return await this.requestClovaFeedback(userPrompt);
  }

  private async requestClovaFeedback(
    userPrompt: string,
  ): Promise<InterviewFeedbackResponse> {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: this.systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      thinking: { effort: 'none' },
      topP: 0.3,
      topK: 0,
      maxCompletionTokens: 5000,
      temperature: 0,
      repeatPenalty: 1.1,
      seed: 0,
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Clova API Error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as ClovaApiResponse;
      const content = data.result.message.content;
      return JSON.parse(content) as InterviewFeedbackResponse;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `면접 총평을 생성하는데 실패했습니다.: ${error.message}`,
        );
      }

      throw new InternalServerErrorException(
        '면접 총평을 생성하는데 실패했습니다.',
      );
    }
  }

  private buildUserPrompt(
    questions: InterviewQuestion[],
    answers: InterviewAnswer[],
  ): string {
    const prompts: string[] = [];
    const loopLength = Math.max(questions.length, answers.length);

    for (let i = 0; i < loopLength; i++) {
      if (questions[i]) {
        prompts.push(`면접관: ${questions[i].content}\n\n`);
      }
      if (answers[i]) {
        prompts.push(`지원자: ${answers[i].content}\n\n`);
      }
    }

    return prompts.join('');
  }
}
