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
              content: "가장 강점이라고 생각하는 기술은 무엇인가요?",
              createdAt: new Date(Date.now() - 300000).toISOString(),
            },
            answer: {
              content:
                "저의 가장 큰 강점은 문제 해결 능력입니다. 복잡한 문제를 작은 단위로 나누어 해결하는 것을 잘합니다.",
              createdAt: new Date(Date.now() - 240000).toISOString(),
            },
          },
          {
            question: {
              content: "가장 도전적이었던 프로젝트에 대해 말씀해주세요.",
              createdAt: new Date(Date.now() - 180000).toISOString(),
            },
            answer: {
              content:
                "대규모 웹 애플리케이션의 성능 최적화 프로젝트를 진행했습니다. 수백만 명의 사용자를 위한 성능 개선이 핵심 목표였습니다.",
              createdAt: new Date(Date.now() - 120000).toISOString(),
            },
          },
          {
            question: {
              content: "촉박한 마감은 어떻게 처리하시나요?",
              createdAt: new Date(Date.now() - 60000).toISOString(),
            },
            answer: {
              content:
                "작업의 우선순위를 정하고, 팀과 명확하게 소통하며, 가장 중요한 기능을 먼저 완성하는 데 집중합니다.",
              createdAt: new Date(Date.now() - 30000).toISOString(),
            },
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
              content: "가장 강점이라고 생각하는 기술은 무엇인가요?",
              createdAt: new Date(Date.now() - 300000).toISOString(),
            },
            answer: {
              content:
                "저의 가장 큰 강점은 문제 해결 능력입니다. 복잡한 문제를 작은 단위로 나누어 해결하는 것을 잘합니다.",
              createdAt: new Date(Date.now() - 240000).toISOString(),
            },
          },
          {
            question: {
              content: "가장 도전적이었던 프로젝트에 대해 말씀해주세요.",
              createdAt: new Date(Date.now() - 180000).toISOString(),
            },
            answer: {
              content:
                "대규모 웹 애플리케이션의 성능 최적화 프로젝트를 진행했습니다. 수백만 명의 사용자를 위한 성능 개선이 핵심 목표였습니다.",
              createdAt: new Date(Date.now() - 120000).toISOString(),
            },
          },
          {
            question: {
              content: "촉박한 마감은 어떻게 처리하시나요?",
              createdAt: new Date(Date.now() - 60000).toISOString(),
            },
            answer: {
              content:
                "작업의 우선순위를 정하고, 팀과 명확하게 소통하며, 가장 중요한 기능을 먼저 완성하는 데 집중합니다.",
              createdAt: new Date(Date.now() - 30000).toISOString(),
            },
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
        question: "JavaScript의 이벤트 루프에 대해 설명해주세요.",
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
        question: "JavaScript의 이벤트 루프에 대해 설명해주세요.",
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
        type: "PORTFOLIO",
        portfolioId: "mock-portfolio-id-1",
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
        type: "PORTFOLIO",
        portfolioId: "mock-portfolio-id-1",
        title: "포트폴리오",
        content: "포트폴리오 내용입니다.",
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // 포트폴리오 수정
  http.patch(
    absolute(`/document/:documentId/portfolio`),
    async ({ params }) => {
      return HttpResponse.json(
        {
          documentId: params.documentId,
          type: "PORTFOLIO",
          portfolioId: "mock-portfolio-id-1",
          title: "수정된 포트폴리오",
          content: "수정된 내용입니다.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          modifiedAt: new Date().toISOString(),
        },
        { status: 200 },
      );
    },
  ),
  http.patch(`/document/:documentId/portfolio`, async ({ params }) => {
    return HttpResponse.json(
      {
        documentId: params.documentId,
        type: "PORTFOLIO",
        portfolioId: "mock-portfolio-id-1",
        title: "수정된 포트폴리오",
        content: "수정된 내용입니다.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
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
        coverLetterId: "mock-cover-letter-1",
        type: "COVER",
        title: "자기소개서",
        content: [
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
        coverLetterId: "mock-cover-letter-1",
        type: "COVER",
        title: "자기소개서",
        content: [
          { question: "지원 동기는?", answer: "열정적으로 일하고 싶습니다." },
        ],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // 자기소개서 수정
  http.put(
    absolute(`/document/:documentId/cover-letter`),
    async ({ params }) => {
      return HttpResponse.json(
        {
          documentId: params.documentId,
          coverLetterId: "mock-cover-letter-1",
          type: "COVER",
          title: "수정된 자기소개서",
          content: [
            { question: "지원 동기는?", answer: "열정적으로 일하고 싶습니다." },
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          modifiedAt: new Date().toISOString(),
        },
        { status: 200 },
      );
    },
  ),
  http.put(`/document/:documentId/cover-letter`, async ({ params }) => {
    return HttpResponse.json(
      {
        documentId: params.documentId,
        coverLetterId: "mock-cover-letter-1",
        type: "COVER",
        title: "수정된 자기소개서",
        content: [
          { question: "지원 동기는?", answer: "열정적으로 일하고 싶습니다." },
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
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
      {
        score: "85",
        feedback:
          "전반적으로 좋은 답변이었습니다. 명확한 설명과 논리적 사고가 돋보였습니다.",
      },
      { status: 200 },
    );
  }),
  http.post(`/interview/feedback`, async () => {
    return HttpResponse.json(
      {
        score: "85",
        feedback:
          "전반적으로 좋은 답변이었습니다. 명확한 설명과 논리적 사고가 돋보였습니다.",
      },
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
        score: "85",
        feedback:
          "전반적으로 좋은 답변이었습니다. 명확한 설명과 논리적 사고가 돋보였습니다.",
      },
      { status: 200 },
    );
  }),
  http.get(`/interview/:interviewId/feedback`, async () => {
    return HttpResponse.json(
      {
        score: "85",
        feedback:
          "전반적으로 좋은 답변이었습니다. 명확한 설명과 논리적 사고가 돋보였습니다.",
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
            type: "TECH",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            score: "85",
          },
          {
            interviewId: "mock-interview-2",
            title: "프론트엔드 면접",
            type: "TECH",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            score: "92",
          },
          {
            interviewId: "mock-interview-3",
            title: "React 전문가 면접",
            type: "TECH",
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            score: "78",
          },
        ],
        totalPage: 1,
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
            type: "TECH",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            score: "85",
          },
          {
            interviewId: "mock-interview-2",
            title: "프론트엔드 면접",
            type: "TECH",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            score: "92",
          },
          {
            interviewId: "mock-interview-3",
            title: "React 전문가 면접",
            type: "TECH",
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            score: "78",
          },
        ],
        totalPage: 1,
      },
      { status: 200 },
    );
  }),
];
