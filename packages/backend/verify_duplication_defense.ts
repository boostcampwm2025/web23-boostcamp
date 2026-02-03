
import { InterviewAIService, ClovaInterviewResponse } from './src/interview/interview-ai.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { InterviewQuestion } from './src/interview/entities/interview-question.entity';

// Mock Logger
const mockLogger = {
  log: (msg: string) => console.log(`[LOG] ${msg}`),
  debug: (msg: string) => console.log(`[DEBUG] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string, trace?: string) => console.error(`[ERROR] ${msg}`, trace),
} as unknown as Logger;

// Mock ConfigService
const mockConfigService = {
  get: (key: string) => {
    if (key === 'CLOVA_API_URL') return 'https://mock.clova.api';
    if (key === 'CLOVA_API_KEY') return 'mock-key';
    return null;
  },
} as unknown as ConfigService;

// Create Instance but we need to inject dependencies manually if we were using Nest, 
// but here we can just instantiate the class since it's a unit test style simulation.
// However, InterviewAIService uses private logger and injection in constructor.
// Let's subclass to inject mocks or just use a helper if possible.
// Since we are observing behavior through logs and return values, we can patch the prototype or use a test-friendly valid instance.

// To properly test, we should mock globals.fetch.
const originalFetch = global.fetch;

async function runSimulation() {
  console.log('--- Starting Duplicate Defense Simulation ---');

  // Instantiate Service
  const service = new InterviewAIService(mockConfigService);
  // Inject mock logger (hacky but works for simulation without DI container)
  (service as any).logger = mockLogger;

  // Setup common data
  const userInfo = "User Resume...";
  const visitedTopics = [];
  const isLastQuestion = false;
  const existingQuestions: InterviewQuestion[] = [
    { content: "What is DI?" } as InterviewQuestion,
  ];
  const answers = [];

  // --- Scenario 1: Retry Success ---
  console.log('\n[Scenario 1] Duplicate -> Retry -> Success');
  
  let callCount1 = 0;
  global.fetch = async (url: any, options: any) => {
    callCount1++;
    const body = JSON.parse(options.body);
    
    // Simulate first response as duplicate
    if (callCount1 === 1) {
      console.log('  -> Simulating Mock Response 1: Duplicate "What is DI?"');
      return {
        ok: true,
        json: async () => ({
          result: {
            message: {
              content: JSON.stringify({
                question: "What is DI?",
                tags: ["tech"],
                isLast: false,
              })
            }
          }
        })
      } as any;
    }
    
    // Simulate second response as unique
    if (callCount1 === 2) {
      console.log('  -> Simulating Mock Response 2: Unique "Explain NestJS modules."');
       return {
        ok: true,
        json: async () => ({
          result: {
            message: {
              content: JSON.stringify({
                question: "Explain NestJS modules.",
                tags: ["nest"],
                isLast: false,
              })
            }
          }
        })
      } as any;
    }
    
    return { ok: false } as any;
  };

  const result1 = await service.generateInterviewQuestion(
    existingQuestions,
    answers,
    userInfo,
    visitedTopics,
    isLastQuestion
  );
  
  console.log('  Result 1 Question:', result1.question);
  if (result1.question === "Explain NestJS modules." && callCount1 === 2) {
    console.log('  ✅ PASSED: Retried and got unique question.');
  } else {
    console.error('  ❌ FAILED: Did not handle duplicate correctly.', { callCount: callCount1, question: result1.question });
  }

  // --- Scenario 2: Termination Fallback ---
  console.log('\n[Scenario 2] Duplicate -> Retry -> Duplicate (Force Termination)');
  
  let callCount2 = 0;
  global.fetch = async (url: any, options: any) => {
    callCount2++;
    const body = JSON.parse(options.body);
    
    // Check if prompt contains termination instruction
    const isTerminationPrompt = body.messages.some((m: any) => m.content.includes("!!! 종료 모드 (Termination Mode) !!!"));
    if (isTerminationPrompt) {
        console.log('  -> Detected Termination Prompt in Request');
    }

    console.log(`  -> Simulating Mock Response ${callCount2}: Duplicate "What is DI?"`);
    // Always return duplicate
    return {
      ok: true,
      json: async () => ({
        result: {
          message: {
            content: JSON.stringify({
              question: "What is DI?",
              tags: ["tech"],
              isLast: false, // API might return false, but service should force true or request properly
            })
          }
        }
      })
    } as any;
  };

  const result2 = await service.generateInterviewQuestion(
    existingQuestions,
    answers,
    userInfo,
    visitedTopics,
    isLastQuestion
  );

  console.log('  Result 2 Question:', result2.question);
  console.log('  Result 2 isLast:', result2.isLast);

  if (result2.isLast === true) {
     console.log('  ✅ PASSED: Forced termination logic (isLast=true).');
  } else {
     console.error('  ❌ FAILED: Did not force termination.');
  }

  // Restore fetch
  global.fetch = originalFetch;
}

runSimulation().catch(e => console.error(e));
