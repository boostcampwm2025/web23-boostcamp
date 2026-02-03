import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { InterviewAIService } from '../src/interview/interview-ai.service';
import { InterviewQuestion } from '../src/interview/entities/interview-question.entity';
import { InterviewAnswer } from '../src/interview/entities/interview-answer.entity';

async function runTest() {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ['.env', '.env.test'],
      }),
    ],
    providers: [InterviewAIService],
  }).compile();

  const service = module.get<InterviewAIService>(InterviewAIService);

  console.log('--- Starting Clova JSON Verification Test ---');

  // Dummy Data
  const questions: InterviewQuestion[] = [
    { content: '첫 번째 질문입니다.' } as InterviewQuestion,
    { content: '두 번째 질문입니다.' } as InterviewQuestion,
  ];
  const answers: InterviewAnswer[] = [
    { content: '첫 번째 ddd.' } as InterviewAnswer,
    { content: '두 번째 ddd.' } as InterviewAnswer,
  ];
  const userInfo = '지원자 이력서: 백엔드 개발자, Node.js, NestJS 경험 있음.';
  const visitedTopics = ['Node.js', 'NestJS'];
  const isLastQuestion = true; // Problematic scenario

  try {
    console.log('Sending request to Clova (isLastQuestion=true)...');
    const startTime = Date.now();

    const result = await service.generateInterviewQuestion(
      questions,
      answers,
      userInfo,
      visitedTopics,
      isLastQuestion,
    );

    const duration = Date.now() - startTime;
    console.log(`Request completed in ${duration}ms`);
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.isLast !== true) {
      console.warn('WARNING: isLast should be true but got false');
    }

    if (!result.question) {
      console.error('ERROR: Question field is empty');
    } else {
      console.log('SUCCESS: Valid JSON response received.');
    }
  } catch (error) {
    console.error('TEST FAILED:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }
  }
}

void runTest();
