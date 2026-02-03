# 🧠 LLM 기반 기술 면접 질문 생성 기능 리서치 및 테스트 계획서

## 1. 개요 (Overview)
사용자의 **이력서(Resume)** 와 **포트폴리오(Portfolio)**, 그리고 기존 **면접 답변 이력**을 바탕으로, 실제 기술 면접 상황과 유사한 **꼬리물기 식 기술 질문**을 생성하는 기능을 구현하고자 합니다.
본 문서는 해당 기능을 구현하기 전, 최적의 프롬프트 설계와 질문 품질 검증을 위한 리서치 계획을 정의합니다.

## 2. 목표 (Goals)
- **적합성(Relevance)**: 사용자의 기술 스택과 프로젝트 경험에 부합하는 질문인가?
- **깊이(Depth)**: 단순 개념 질문을 넘어, 프로젝트 경험에 기반한 문제 해결 능력을 묻는가?
- **한국어 최적화(Korean Optimization)**: **HyperCLOVA X**의 강점을 살려, 자연스럽고 전문적인 한국어 면접 질문을 생성하는가?
- **일관성(Consistency)**: 동일한 입력에 대해 일관된 품질(난이도, 톤앤매너)의 질문을 생성하는가?
- **형식 준수(Formatting)**: 프론트엔드에서 파싱하기 쉬운 구조(JSON 등)로 출력되는가?

## 3. 리서치 및 프롬프트 전략 (Research & Prompt Strategy)

### 3.1. 입력 데이터 구조 분석
LLM에게 제공할 Context 정보를 구조화합니다.
- **Resume Context**: 기술 스택(Skills), 경력(Experience) 요약.
- **Portfolio Context**: 프로젝트 설명, 담당 역할, 주요 문제 해결 경험.
- **History Context**: 이전 질문과 사용자의 답변 (꼬리물기 질문 생성 시 필요).

### 3.2. 프롬프트 페르소나 (Persona) 설정
- **Role**: "10년차 시니어 개발자 면접관" or "깐깐한 Tech Lead"
- **Tone**: 전문적임, 논리적임, 압박 면접 보다는 '검증' 위주.
- **Task**: "지원자의 경험을 검증하기 위한 날카로운 기술 질문 1개를 생성하라."

### 3.3. 주요 프롬프트 테크닉
- **CoT (Chain of Thought)**: 질문을 바로 생성하지 않고, 이력서를 먼저 분석하게 한 뒤 질문을 생성하도록 유도.
  > "먼저 지원자의 프로젝트 A에서 사용된 기술 B의 잠재적 문제점을 분석해라. 그 후, 이를 방어하기 위한 질문을 작성하라."
- **Few-Shot Prompting**: 좋은 질문과 나쁜 질문의 예시를 제공하여 품질 기준 학습.

## 4. 테스트 시나리오 (Test Scenarios)

### Case 1: 신입 프론트엔드 개발자 (React 중심)
- **입력**: React, TypeScript, 상태 관리(Redux) 사용 경험, To-Do List 프로젝트.
- **검증 포인트**:
  - 단순 "React란 무엇인가?"가 아닌 -> "Redux를 사용하면서 겪은 비효율적인 렌더링 최적화 경험이 있는가?" 와 같은 질문이 나오는지 확인.

### Case 2: 백엔드 개발자 (대용량 트래픽 처리 경험)
- **입력**: Node.js, Redis, AWS, 선착순 이벤트 처리 프로젝트.
- **검증 포인트**:
  - 동시성 문제(Concurrency), 캐싱 전략 등 아키텍처 레벨의 질문 생성 여부.

### Case 3: 엣지 케이스 (정보 부족)
- **입력**: "열심히 하겠습니다" 외 기술 정보 전무.
- **검증 포인트**:
  - "이력서에 기술적인 내용이 부족합니다"라는 피드백을 주거나, CS 기초 질문으로 유도하는지 확인.

## 5. 평가 기준 및 메트릭 (Evaluation Metrics)

| 평가 항목 | 설명 | 점수 (1~5) |
| :--- | :--- | :--- |
| **Hallucination** | 없는 프로젝트나 사용하지 않은 기술에 대해 질문하지 않는가? | Pass/Fail |
| **Relevance** | 사용자의 실제 경험(프로젝트)과 연결된 질문인가? | 1-5 |
| **Depth** | 'Why'와 'How'를 묻는 심층 질문인가? | 1-5 |
| **Structure** | JSON 포맷 및 필드(question, intent, difficulty)가 정확한가? | Pass/Fail |

## 6. 향후 일정 (Action Plan)
1.  **Prompt Drafting**: 기본 프롬프트(v0.1) 작성. (HyperCLOVA X의 한국어 뉘앙스 처리를 고려)
2.  **Manual Testing**: **Clova Studio**를 통해 수동 테스트 진행 (Case 1~3).
3.  **Refinement**: 테스트 결과를 바탕으로 프롬프트 튜닝 (System Prompt vs User Prompt 구조 최적화).
4.  **Integration**: 백엔드 API (`InterviewQuestionService`) 구현. (Clova API 연동)
