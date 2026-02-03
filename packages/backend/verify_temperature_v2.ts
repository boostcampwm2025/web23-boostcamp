
// import * as dotenv from 'dotenv';
// import * as path from 'path';

// // Load environment variables from packages/backend/.env
// dotenv.config({ path: path.resolve(__dirname, 'packages/backend/.env') });

// const SYSTEM_PROMPT = `
// # Role
// 10년 차 시니어 개발자 면접관. 주니어 지원자의 '기술적 깊이(User vs Engineer)' 검증.
// - 검증 흐름: 경험 → 근거/트레이드오프 → 검증/디버깅(동작 원리).
// - 목표: 단순 사용 경험을 넘어 원리 이해도와 문제 해결 능력 확인.

// # Primary Directives (최우선 준수 사항)
// 1. 중복 주제 절대 금지 (Highest Priority):
//    - [제외된 주제]에 포함된 키워드, 기술, 개념에 대한 질문은 절대 금지.
//    - 꼬리 질문이라 하더라도, 이미 논의된 [제외된 주제]로 되돌아가지 말 것.
//    - 최근 대화 내역에 있는 질문을 절대로 반복해서 질문하지 말 것.
// 2. Force Switch (즉시 주제 전환) 필수:
//    - 지원자가 **"모름", "경험 없음", "잘 모르겠습니다"** 등의 부정적 답변을 하거나,
//    - 답변의 깊이가 얕아 더 이상 질문할 것이 없다고 판단되면,
//    - **즉시** 현재 주제를 종료하고 [제외된 주제]에 없는 **완전히 새로운 주제(Scenario A)** 로 전환하라.
//    - 절대 아는 척 넘어가거나 설명을 유도하지 말 것.
// 3. Context Alignment (맥락 일치 및 중복 질문 방지):
//    - **Critical**: 지원자가 답변에서 이미 언급한 키워드나 내용을 "사용했나요?" 혹은 "무엇인가요?"라고 다시 묻지 말 것.
//    - 이미 언급된 내용은 **'이미 알고 있는 사실(Fact)'**로 간주하고, 그 **Why(이유), How(구체적 구현), Trade-off(대안 비교)**를 묻는 심층 질문으로 즉시 넘어갈 것.
//    - 충분히 물어봤다고 판단되면, 즉시 주제를 전환할 것
//    - 예시:
//      - 답변: "Kakfa를 사용해 비동기 처리를 구현했습니다."
//      - 나쁜 질문 (X): "Kafka를 사용하셨나요?", "Kafka가 무엇인가요?"
//      - 좋은 질문 (O): "Kafka 외에 RabbitMQ 같은 대안도 있었을 텐데, 왜 Kafka를 선택했나요?"

// # Critical Guidelines
// 1. 단순 정의 금지: "A란 무엇인가?" 금지. 동작 흐름/실행 순서/예외 추론을 물을 것.
// 2. Deep Dive (심층 검증): 답변이 모호하면 즉시 근거(수치), 대안, 검증(로그/지표) 요구.
// 3. Tags 관리: 질문의 핵심 키워드(기술/개념) 2~3개 추출. (다음 턴 제외 주제로 사용)
// 4. 종료 조건: (누적 Unique Tags + 현재 Tags) ≥ 20개면 isLast: true.

// # Scenarios
// 상황에 따라 아래 전략 중 하나를 선택.

// ## Scenario A. 새 주제 시작 (New Topic Router)
// Trigger: 대화 시작, Force Switch 조건 달성, 최근 대화에서 꼬리 질문 3회 이상 진행 시.
// Action: [제외된 주제]에 **없는** 새로운 토픽을 선정하여 질문.
// - A1. 프로젝트 기반 (Project-Based):
//   - 이력서의 특정 프로젝트/기술 지목.
//   - 필수 포함: 기술 선택 이유(대안 비교), 설정 근거(트레이드오프), 장애 극복 사례 중 택 1.
// - A2. 언어/런타임 기본기 (Language/Runtime):
//   - 이력서 내 언어/프레임워크 지목.
//   - 방향: 정의가 아닌 동작 원리, 실행 순서, 동시성 이슈 추론.

// ## Scenario B. 심층 꼬리 질문 (Deep Dive)
// Trigger: 답변은 타당하나 깊이/근거가 부족할 때.
// - **[제외된 주제]와 겹치지 않는 선에서** 깊이를 더함.
// - 방향: 트래픽 부하 가정, 정합성/순서 보장 실패 모드, 엣지케이스, 검증 방법.

// ## Scenario C. CS/원리 연결 (CS Bridge)
// Trigger: 단순 사용 경험('User' level)에 그치거나 자동화된 동작 이해가 의심될 때.
// - 기술을 CS 원리(OS, Network, DB)와 연결.

// # Self-Check (Internal)
// - 생성된 question이 [제외된 주제]를 포함하는가? -> 즉시 폐기하고 다시 생성.
// - 지원자가 모른다고 했는가? -> 즉시 다른 주제로 전환했는가 확인.
// - question이 빈값이지는 않은가?
// `;

// const USER_INFO = `
// [PORTFOLIO]
// 프로젝트: 온라인 쇼핑몰 백엔드 개발
// 기술 스택: NestJS, TypeORM, MySQL, Redis
// 담당 업무:
// - 상품 목록 조회 API 성능 최적화 (인덱싱, 캐싱)
// - 주문 동시성 제어 (Redis Lock 사용)
// - 결제 시스템 연동 (Toss Payments)

// [COVER LETTER]
// Q: 지원 동기가 무엇인가요?
// A: 백엔드 개발자로서 대용량 트래픽 처리에 관심이 많아 지원했습니다.
// `;

// const CLOVA_API_URL = process.env.CLOVA_API_URL;
// const CLOVA_API_KEY = process.env.CLOVA_API_KEY;

// if (!CLOVA_API_URL || !CLOVA_API_KEY) {
//   console.error("Error: CLOVA_API_URL or CLOVA_API_KEY is missing in .env");
//   process.exit(1);
// }

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// async function fetchAIQuestion(temperature: number, attempt: number) {
//   const messages = [
//     { role: 'system', content: SYSTEM_PROMPT },
//     {
//       role: 'user',
//       content: `
//             ***[컨텍스트: 이력서 및 포트폴리오]***
//             ${USER_INFO}
            
//             ***[제외된 주제 (질문 금지)]***
//             이미 대화한 다음 주제들에 대해서는 절대 중복하여 질문하지 마십시오:
//             []
            
//             ***[컨텍스트: 현재 입력]***
//             - 직전 지원자 답변: 없음 (첫 질문)
        
//             ***[필수 규칙]***
//             - **빈 값 금지**: "question" 및 "tags" 배열의 항목은 절대 빈 문자열("")이어서는 안 됩니다. 반드시 유의미한 내용을 포함하십시오.
//             - 최소 10자 이상의 질문을 생성하십시오.
//       `
//     }
//   ];

//   try {
//     const response = await fetch(CLOVA_API_URL!, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${CLOVA_API_KEY}`,
//         "Content-Type": "application/json",
//          "Accept": "application/json",
//       },
//       body: JSON.stringify({
//         messages,
//         thinking: { effort: 'none' },
//         topP: 0.8,
//         topK: 0,
//         maxCompletionTokens: 1024,
//         temperature: temperature,
//         repeatPenalty: 1.1,
//         seed: 0, 
//         responseFormat: {
//           type: 'json',
//           schema: {
//             type: 'object',
//             properties: {
//               question: { type: 'string', minLength: 10 },
//               tags: { type: 'array', items: { type: 'string', minLength: 1 } },
//               isLast: { type: 'boolean' },
//             },
//             required: ['question', 'tags', 'isLast'],
//             additionalProperties: false,
//           },
//         },
//       }),
//     });

//     if (!response.ok) {
//        const text = await response.text();
//        console.error(`[Error] Temp: ${temperature}, Attempt: ${attempt}, Status: ${response.status}, Res: ${text}`);
//        return null;
//     }

//     const data: any = await response.json();
//     const content = data.result?.message?.content;
    
//     // Parse JSON
//     const jsonMatch = content.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//         console.error(`[Error] Temp: ${temperature}, Attempt: ${attempt} - Invalid JSON format in response.`);
//         return null;
//     }
//     const parsed = JSON.parse(jsonMatch[0]);
//     console.log(`[Temp: ${temperature} | #${attempt}] Question: ${parsed.question}`);

//   } catch (error) {
//     console.error(`[Error] Temp: ${temperature}, Attempt: ${attempt}, Msg: ${error}`);
//   }
// }

// async function runTest() {
//   const temperatures = [0.4, 0.5, 0.6, 0.7];
//   const iterations = 10;

//   console.log("Starting Temperature Test...");
//   console.log(`Config: Temperatures=[${temperatures}], Iterations=${iterations} per temp, Delay=10s`);

//   for (const temp of temperatures) {
//     console.log(`\n--- Testing Temperature: ${temp} ---`);
//     for (let i = 1; i <= iterations; i++) {
//       await fetchAIQuestion(temp, i);
//       if (i < iterations) {
//            await sleep(10000); // 10 seconds delay
//       }
//     }
//     if (temp !== temperatures[temperatures.length - 1]) {
//        await sleep(10000); 
//     }
//   }
//   console.log("\nTest Completed.");
// }

// runTest();
