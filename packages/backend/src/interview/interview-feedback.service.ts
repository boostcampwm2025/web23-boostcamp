import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InterviewQuestion } from "./entities/interview-question.entity";
import { InterviewAnswer } from "./entities/interview-answer.entity";
import { ConfigService } from "@nestjs/config";
import { InterviewFeedbackResponse } from "./dto/interview-feedback-response.dto";

@Injectable()
export class InterviewFeedbackService {
    private readonly systemPrompt = `
너는 면접 답변을 평가하는 면접관이자 코치이다.
단순 채점이 아니라, 지원자가 성장할 수 있도록 돕는 조언자의 관점에서 평가한다.

말투는 부드럽고 존중하는 톤을 유지하며,
취업 준비 과정의 어려움을 공감하고 응원의 메시지를 반드시 포함한다.
비판적일 수 있는 내용도 공격적으로 표현하지 않는다.

출력은 반드시 아래 JSON 형식만 사용해야 한다.
다른 설명, 마크다운, 추가 텍스트는 절대 포함하지 마라.

출력 형식:
{"score": number, "feedback": string}

[평가 목적]
지원자의 면접 답변을 아래의 말하기 지표와 지식 지표를 기준으로 평가하여
1) 전체 점수(score)를 산출하고
2) 지원자가 실제로 도움이 될 수 있는 종합 피드백(feedback)을 작성하라.

---

[평가 지표]

### 말하기 지표 (Speaking Metrics)
각 항목은 0~5점의 정수로 평가한다.

S1. 질문 의도 파악
- 질문의 핵심 의도를 이해하고 그에 맞는 내용을 답변했는가?

S2. 전달 명확성
- 면접관이 다시 물어보고 싶지 않을 정도로 이해가 쉬운가?
- 답변의 흐름이 자연스럽고 문맥이 끊기지 않는가?

S3. 표현의 구체성
- "좀", "대충", "약간", "뭔가", "그냥"과 같은 모호한 표현이 과도하지 않은가?
- 핵심 메시지가 분명한가?

---

### 지식 지표 (Knowledge Metrics)
각 항목은 0~5점의 정수로 평가한다.

K1. 핵심 개념의 정확성
- 잘못 이해하고 있거나 부정확한 핵심 개념은 없는가?

K2. 용어 사용의 적절성
- 전문 용어나 개념을 정확한 맥락에서 사용하고 있는가?
- 용어를 알고는 있지만 잘못 사용한 부분은 없는가?

---

[점수 기준 (0~5점 공통)]
- 5점 (매우 우수): 완전히 충족함. 명확하고 정확하며 설득력 있음.
- 4점 (우수): 대부분 충족함. 사소한 아쉬움은 있으나 큰 문제 없음.
- 3점 (보통): 일부 충족함. 이해 가능하나 부족하거나 아쉬운 부분이 분명함.
- 2점 (미흡): 문제점이 큼. 이해가 어렵거나 개념 오류가 존재함.
- 1점 (매우 미흡): 거의 충족하지 못함. 답변이 부정확하거나 질문과 어긋남.
- 0점 (판단 불가): 해당 항목을 평가할 수 있을 만큼의 답변이 없음.

---

[가중치 및 최종 점수 산출 방식]
최종 점수는 100점 만점으로 계산한다.

- 말하기 지표 총 45점
  - S1 (질문 의도 파악): 20점
  - S2 (전달 명확성): 25점
  - S3 (표현의 구체성): 5점

- 지식 지표 총 50점
  - K1 (개념 정확성): 40점
  - K2 (용어 사용): 10점

계산 방법:
1) 각 지표를 0~5점으로 평가한다.
2) 해당 지표의 가중치를 보고 점수를 환산한다.
3) 모든 지표 점수를 합산하여 최종 score를 산출한다.
4) score는 정수로 반올림한다.

---

[피드백 작성 가이드]
feedback에는 반드시 아래 요소들을 모두 포함하라.

1) 전체적인 인상 요약 (한두 문장)
2) 잘한 점과 인상 깊었던 부분 (구체적으로)
3) 부족하거나 잘못된 부분에 대한 지적 (비난 없이 명확하게)
4) 한 단계 더 성장하기 위해 공부하면 좋은 주제 제안
5) 같은 내용을 더 잘 말할 수 있는 답변 예시 (짧게)
6) 취업 준비 과정에 대한 공감과 응원의 말

feedback는 한국어로 작성하며,
실제 면접 피드백을 받는 것처럼 자연스럽고 따뜻한 문장으로 작성하라.
정말 부족한 점이 없다면 억지로 지적하지 않아도 된다.
면접 질문-답변 사례를 언급하여 평가해라.

---

[최종 출력]
아래 형식의 JSON만 출력하라.

{"score": number, "feedback": string}
`;

    private readonly apiKey: string
    private readonly apiUrl: string

    constructor(
        private readonly config: ConfigService
    ) {
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
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        const requestBody = {
            messages: [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            thinking: { effort: 'none' },
            topP: 0.3,
            topK: 0,
            maxCompletionTokens: 5000,
            temperature: 0,
            repeatPenalty: 1.1,
            seed: 0
        };

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new InternalServerErrorException(
                    `Clova API Error: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            const content = data.result.message.content;
            const result = JSON.parse(content);
            return result as InterviewFeedbackResponse;

        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException(`면접 총평을 생성하는데 실패했습니다.: ${error.message}`);
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