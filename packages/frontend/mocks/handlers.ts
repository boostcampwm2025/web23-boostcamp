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

  // 포트폴리오 생성
  http.post(absolute(`/document/portfolio/create`), async () => {
    return HttpResponse.json(
      {
        documentId: `mock-portfolio-${Date.now()}`,
        type: "PORTFOLIO",
        title: "테스트 포트폴리오",
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),
  http.post(`/document/portfolio/create`, async () => {
    return HttpResponse.json(
      {
        documentId: `mock-portfolio-${Date.now()}`,
        type: "PORTFOLIO",
        title: "테스트 포트폴리오",
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // 자기소개서 생성
  http.post(absolute(`/document/cover-letter/create`), async () => {
    return HttpResponse.json(
      {
        documentId: `mock-cover-${Date.now()}`,
        type: "COVER",
        title: "테스트 자기소개서",
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),
  http.post(`/document/cover-letter/create`, async () => {
    return HttpResponse.json(
      {
        documentId: `mock-cover-${Date.now()}`,
        type: "COVER",
        title: "테스트 자기소개서",
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // 포트폴리오 상세 조회
  http.get(absolute(`/document/:documentId/portfolio`), async () => {
    return HttpResponse.json(
      {
        documentId: "mock-portfolio-1",
        title: "포트폴리오",
        content: "포트폴리오 내용입니다.",
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),
  http.get(`/document/:documentId/portfolio`, async () => {
    return HttpResponse.json(
      {
        documentId: "mock-portfolio-1",
        title: "포트폴리오",
        content: "포트폴리오 내용입니다.",
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // 포트폴리오 수정
  http.patch(absolute(`/document/:documentId/portfolio`), async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
  http.patch(`/document/:documentId/portfolio`, async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // 포트폴리오 삭제
  http.delete(absolute(`/document/:documentId/portfolio`), async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
  http.delete(`/document/:documentId/portfolio`, async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // 자기소개서 상세 조회
  http.get(absolute(`/document/:documentId/cover-letter`), async () => {
    return HttpResponse.json(
      {
        documentId: "mock-cover-1",
        title: "자기소개서",
        qa: [
          { question: "지원 동기는?", answer: "열정적으로 일하고 싶습니다." },
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),
  http.get(`/document/:documentId/cover-letter`, async () => {
    return HttpResponse.json(
      {
        documentId: "mock-cover-1",
        title: "자기소개서",
        qa: [
          { question: "지원 동기는?", answer: "열정적으로 일하고 싶습니다." },
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // 자기소개서 수정
  http.put(absolute(`/document/:documentId/cover-letter`), async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
  http.put(`/document/:documentId/cover-letter`, async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // 자기소개서 삭제
  http.delete(absolute(`/document/:documentId/cover-letter`), async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
  http.delete(`/document/:documentId/cover-letter`, async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // 문서 일괄 삭제
  http.delete(absolute(`/document`), async () => {
    return HttpResponse.json(
      { deletedCount: 2, failedIds: [] },
      { status: 200 },
    );
  }),
  http.delete(`/document`, async () => {
    return HttpResponse.json(
      { deletedCount: 2, failedIds: [] },
      { status: 200 },
    );
  }),

  // 면접 종료
  http.post(absolute(`/interview/stop`), async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
  http.post(`/interview/stop`, async () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // 피드백 생성
  http.post(absolute(`/interview/feedback`), async () => {
    return HttpResponse.json(
      { feedbackId: `feedback-${Date.now()}` },
      { status: 200 },
    );
  }),
  http.post(`/interview/feedback`, async () => {
    return HttpResponse.json(
      { feedbackId: `feedback-${Date.now()}` },
      { status: 200 },
    );
  }),

  // 면접 시간 조회
  http.get(absolute(`/interview/:interviewId/time`), async () => {
    return HttpResponse.json({ duration: 1800 }, { status: 200 });
  }),
  http.get(`/interview/:interviewId/time`, async () => {
    return HttpResponse.json({ duration: 1800 }, { status: 200 });
  }),

  // 피드백 조회
  http.get(absolute(`/interview/:interviewId/feedback`), async () => {
    return HttpResponse.json(
      {
        feedback: "전반적으로 좋은 답변이었습니다.",
        score: 85,
        strengths: ["명확한 설명", "논리적 사고"],
        improvements: ["구체적인 예시 추가"],
      },
      { status: 200 },
    );
  }),
  http.get(`/interview/:interviewId/feedback`, async () => {
    return HttpResponse.json(
      {
        feedback: "전반적으로 좋은 답변이었습니다.",
        score: 85,
        strengths: ["명확한 설명", "논리적 사고"],
        improvements: ["구체적인 예시 추가"],
      },
      { status: 200 },
    );
  }),

  // 면접 목록
  http.get(absolute(`/interview`), async () => {
    return HttpResponse.json(
      {
        interviews: [
          {
            interviewId: "mock-interview-1",
            title: "기술 면접 시뮬레이션",
            createdAt: new Date().toISOString(),
            status: "completed",
          },
        ],
      },
      { status: 200 },
    );
  }),
  http.get(`/interview`, async () => {
    return HttpResponse.json(
      {
        interviews: [
          {
            interviewId: "mock-interview-1",
            title: "기술 면접 시뮬레이션",
            createdAt: new Date().toISOString(),
            status: "completed",
          },
        ],
      },
      { status: 200 },
    );
  }),
];
