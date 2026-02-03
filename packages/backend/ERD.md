# Entity Relationship Diagram (ERD)

## Diagram

```mermaid
erDiagram
    users {
        bigint user_id PK "사용자 고유 ID"
        varchar user_email "이메일 주소"
        varchar sub "OAuth 고유 ID (Subject)"
        enum role "역할 (USER | ADMIN)"
        varchar profile_url "프로필 이미지 URL"
        timestamp created_at "생성 일시"
        timestamp modified_at "최종 수정 일시"
    }

    documents {
        bigint documents_id PK "문서 고유 ID"
        enum type "문서 유형 (COVER | PORTFOLIO)"
        varchar title "문서 제목"
        timestamp created_at "생성 일시"
        timestamp modified_at "최종 수정 일시"
        bigint user_id FK "소유자 사용자 ID"
    }

    cover_letters {
        bigint cover_letters_id PK "자기소개서 고유 ID"
        bigint documents_id FK "연관된 문서 ID"
    }

    cover_letters_question_answer {
        bigint cover_letters_question_answer_id PK "질문-답변 기록 고유 ID"
        varchar question "질문 내용"
        varchar answer "답변 내용"
        bigint cover_letter_id FK "부모 자기소개서 ID"
    }

    portfolios {
        bigint portfolios_id PK "포트폴리오 고유 ID"
        text content "포트폴리오 내용"
        bigint documents_id FK "연관된 문서 ID"
    }

    interviews {
        bigint interview_id PK "인터뷰 고유 ID"
        varchar title "인터뷰 제목"
        enum type "인터뷰 유형 (TECH | CODE)"
        timestamp created_at "시작 일시"
        enum like_status "사용자 피드백 (NONE | LIKE | DISLIKE)"
        bigint during_time "소요 시간 (밀리초)"
        varchar score "평가 점수 (예: 80/100)"
        varchar feedback "AI 종합 피드백"
        bigint user_id FK "인터뷰 진행자 ID"
    }

    interviews_answers {
        bigint answer_id PK "답변 기록 고유 ID"
        text content "사용자 답변 내용"
        timestamp created_at "답변 일시"
        timestamp modified_at "최종 수정 일시"
        bigint interview_id FK "관련 인터뷰 ID"
    }

    interviews_questions {
        bigint question_id PK "질문 기록 고유 ID"
        varchar content "AI 질문 내용"
        timestamp created_at "질문 일시"
        timestamp modified_at "최종 수정 일시"
        bigint interview_id FK "관련 인터뷰 ID"
        varchar persona_id FK "사용된 AI 페르소나 ID"
    }

    ai_persona {
        varchar persona_id PK "페르소나 고유 ID"
        varchar prompt "페르소나 시스템 프롬프트"
        varchar name "페르소나 이름 (예: 프론트엔드 면접관)"
        varchar img_url "페르소나 이미지 URL"
    }

    technical_interviews {
        bigint technical_interviews_id PK "기술 인터뷰 상세 ID"
        varchar video_url "인터뷰 녹화 URL"
        varchar feedback_content "기술 인터뷰별 상세 피드백"
        bigint interview_id FK "부모 인터뷰 ID"
    }

    interviews_documents {
        bigint interviews_documents_id PK "참조 기록 ID"
        timestamp created_at "참조 일시"
        timestamp modified_at "최종 수정 일시"
        bigint technical_interview_id FK "관련 기술 인터뷰 ID"
        bigint documents_id FK "참조된 문서 ID"
    }

    live_coding_interviews {
        bigint live_coding_interviews_id PK "라이브 코딩 상세 ID"
        enum language "프로그래밍 언어 (예: JS)"
        varchar code "사용자 제출 코드"
        varchar feedback_content "코드에 대한 상세 피드백"
        bigint interview_id FK "부모 인터뷰 ID"
    }

    problems {
        bigint problem_id PK "코딩 문제 ID"
        varchar content "문제 설명"
        bigint live_coding_interviews_id FK "관련 라이브 코딩 세션 ID"
    }

    test_cases {
        bigint test_case_id PK "테스트 케이스 ID"
        varchar input "테스트 입력값"
        varchar output "기대 출력값"
        bigint problem_id FK "부모 문제 ID"
    }

    users ||--o{ documents : "소유함 (1:N)"
    users ||--o{ interviews : "진행함 (1:N)"

    documents ||--|| portfolios : "포함함 (1:1)"
    documents ||--|| cover_letters : "포함함 (1:1)"

    cover_letters ||--o{ cover_letters_question_answer : "포함함 (1:N)"

    interviews ||--o{ interviews_questions : "포함함 (1:N)"
    interviews ||--o{ interviews_answers : "기록함 (1:N)"
    interviews ||--|| technical_interviews : "상세정보 (1:1)"
    interviews ||--|| live_coding_interviews : "상세정보 (1:1)"

    ai_persona ||--o{ interviews_questions : "생성함 (1:N)"

    technical_interviews ||--o{ interviews_documents : "참조함 (1:N)"
    interviews_documents }o--|| documents : "연결됨 (N:1)"

    live_coding_interviews ||--o{ problems : "제시함 (1:N)"
    problems ||--o{ test_cases : "검증됨 (1:N)"
```

## 모듈 설명 (Module Descriptions)

### 1. 사용자 모듈 (`users`)
- **핵심 엔티티**: 애플리케이션 사용자를 나타냅니다.
- **관계**: 한 사용자는 여러 개의 문서를 소유할 수 있고, 여러 번의 인터뷰를 진행할 수 있습니다.

### 2. 문서 모듈 (`documents`, `cover_letters`, `portfolios`)
- **Document**: 사용자가 업로드하거나 생성한 문서의 추상적인 부모 엔티티입니다.
- **다형성**: 문서는 실제 데이터 유형에 따라 **자기소개서(Cover Letter)** 또는 **포트폴리오(Portfolio)** 로 나뉩니다.
    - `cover_letters`: 질문-답변(`cover_letters_question_answer`) 형태의 구조화된 데이터를 저장합니다.
    - `portfolios`: 원본 텍스트/마크다운(`content`) 데이터를 저장합니다.

### 3. 인터뷰 모듈 (`interviews`, `technical_interviews`, `live_coding_interviews`)
- **Interview**: 인터뷰 세션의 핵심 기록입니다. 전체 상태, 소요 시간, 점수 등을 추적합니다.
- **유형**:
    - **기술 면접** (`technical_interviews`): 구두 질의응답에 중점을 둡니다. `interviews_documents`를 통해 사용자의 문서를 참조할 수 있습니다.
    - **라이브 코딩 면접** (`live_coding_interviews`): 코드 작성 및 문제 해결에 중점을 둡니다. `test_cases`를 통해 `problems`를 검증합니다.
- **상호작용**:
    - `interviews_questions`: AI가 생성한 질문입니다.
    - `interviews_answers`: 사용자의 답변(음성 텍스트 변환 또는 텍스트 입력)입니다.

### 4. AI 엔진 (`ai_persona`)
- **역할**: 다양한 AI 페르소나(예: "깐깐한 백엔드 면접관", "친절한 인사담당자")를 정의합니다.
- **활용**: 인터뷰의 각 질문은 특정 페르소나와 연관되어 있어, 다중 페르소나 인터뷰나 특정 역할극(Role-play) 시나리오를 가능하게 합니다.
