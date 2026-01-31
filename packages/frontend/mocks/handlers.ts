import { http, HttpResponse } from "msw";
import type { ICreateInterviewResponse } from "@/app/lib/client/interview";
import type {
  IHistoryResponse,
  IAnswerResponse,
  IGenerateQuestion,
} from "@/app/(tabs)/(simulator)/interview/[id]/actions";
import type { IDocumentsResponse } from "@/app/lib/actions/document";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function absolute(path: string) {
  return `${API_URL}${path}`;
}

export const handlers = [
  // 인터뷰 생성
  http.post(absolute("/interview/tech/create"), async () => {
    return HttpResponse.json(
      { interviewId: `mock-${Date.now()}` } as ICreateInterviewResponse,
      { status: 200 },
    );
  }),
  http.post(`/interview/tech/create`, async () => {
    return HttpResponse.json(
      { interviewId: `mock-${Date.now()}` } as ICreateInterviewResponse,
      { status: 200 },
    );
  }),

  // 히스토리 조회
  http.get(absolute(`/interview/:id/chat/history`), async () => {
    return HttpResponse.json(
      {
        history: [
          {
            question: {
              content: "What is your strongest skill?",
              createdAt: new Date().toISOString(),
            },
            answer: null,
          },
        ],
      } as IHistoryResponse,
      { status: 200 },
    );
  }),
  http.get(`/interview/:id/chat/history`, async () => {
    return HttpResponse.json(
      {
        history: [
          {
            question: {
              content: "What is your strongest skill?",
              createdAt: new Date().toISOString(),
            },
            answer: null,
          },
        ],
      } as IHistoryResponse,
      { status: 200 },
    );
  }),

  // 채팅 응답
  http.post(absolute(`/interview/answer/chat`), async () => {
    return HttpResponse.json(
      { answer: "[MOCK] 채팅 응답" } as IAnswerResponse,
      { status: 200 },
    );
  }),
  http.post(`/interview/answer/chat`, async () => {
    return HttpResponse.json(
      { answer: "[MOCK] 채팅 응답" } as IAnswerResponse,
      { status: 200 },
    );
  }),

  // 음성 응답
  http.post(absolute(`/interview/answer/voice`), async () => {
    return HttpResponse.json(
      { answer: "[MOCK] 음성 응답" } as IAnswerResponse,
      { status: 200 },
    );
  }),
  http.post(`/interview/answer/voice`, async () => {
    return HttpResponse.json(
      { answer: "[MOCK] 음성 응답" } as IAnswerResponse,
      { status: 200 },
    );
  }),

  // 질문 생성
  http.post(absolute(`/interview/tech/question`), async () => {
    return HttpResponse.json(
      {
        questionId: `q-${Date.now()}`,
        question: "Explain event loop.",
        isLast: false,
        createdAt: new Date().toISOString(),
      } as IGenerateQuestion,
      { status: 200 },
    );
  }),
  http.post(`/interview/tech/question`, async () => {
    return HttpResponse.json(
      {
        questionId: `q-${Date.now()}`,
        question: "Explain event loop.",
        isLast: false,
        createdAt: new Date().toISOString(),
      } as IGenerateQuestion,
      { status: 200 },
    );
  }),

  // 문서 목록
  http.get(absolute(`/document`), async () => {
    return HttpResponse.json(
      {
        documents: [
          {
            documentId: "mock-cover-1",
            type: "COVER",
            title: "모의 이력서 (샘플)",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          },
        ],
      } as IDocumentsResponse,
      { status: 200 },
    );
  }),
  http.get(`/document`, async () => {
    return HttpResponse.json(
      {
        documents: [
          {
            documentId: "mock-cover-1",
            type: "COVER",
            title: "모의 이력서 (샘플)",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          },
        ],
      } as IDocumentsResponse,
      { status: 200 },
    );
  }),
];
