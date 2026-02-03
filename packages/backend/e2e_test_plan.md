# E2E 테스트 계획 및 시나리오

이 문서는 백엔드 API의 End-to-End (E2E) 테스트 시나리오를 정의하며, [API 명세서](./api_spec.md)와 [테스트 시나리오](./test_scenario.md)를 매핑하여 정리한 문서입니다.

> **범례 (Legend)**
> - **[G]**: 공통/전역 시나리오 (Global/Common)
> - **[A]**: 인증 시나리오 (Auth)
> - **[D/CL/P]**: 문서/자기소개서/포트폴리오 시나리오 (Document)
> - **[I/TI/ST/FB]**: 면접/피드백 시나리오 (Interview)
> - **[CH/AC/AV]**: 채팅/음성 시나리오 (Chat/Voice)
> - **[Ext]**: 확장/엣지 케이스 (Extended/Edge Cases)

---

## 1. 인증 (Auth)

### `POST /auth/login`
**설명**: 이메일과 비밀번호로 로그인합니다.
- **요청**: `{ "email": "test@example.com", "password": "password" }`
- **시나리오**:
  - **[Happy Path]** 유효한 자격증명
    - Given: 올바른 비밀번호를 가진 기존 유저
    - Response: `200 OK` / `201 Created` (토큰 포함)
  - **[A-01]** 로그인 필드 누락
    - When: Body에 `email` 또는 `password` 누락
    - Response: `400 Bad Request`
  - **[A-02]** 잘못된 자격증명
    - When: 유효한 이메일이나 틀린 비밀번호
    - Response: `401 Unauthorized`
  - **[A-03]** 존재하지 않는 사용자
    - When: 존재하지 않는 이메일
    - Response: `401 Unauthorized` (보안상 권장)
  - **[G-09]** Content-Type 불일치
    - When: `application/json` 대신 `text/plain` 전송
    - Response: `415 Unsupported Media Type` 또는 `400 Bad Request`

---

## 2. 문서 (Documents) - 자기소개서/포트폴리오

### `GET /document`
**설명**: 문서 목록을 조회합니다.
- **요청**: Query `?type=COVER&page=1`
- **시나리오**:
  - **[Happy Path]** 목록 조회
    - Response: `200 OK` 목록
  - **[D-01]** 잘못된 Type Enum
    - When: `type=INVALID`
    - Response: `400 Bad Request`
  - **[D-02]** 잘못된 Sort Enum
    - When: `sort=INVALID`
    - Response: `400 Bad Request`

### `POST /document/cover-letter/create`
**설명**: 자기소개서를 생성합니다.
- **요청**: `{ "title": "...", "content": [{ "question": "...", "answer": "..." }] }`
- **시나리오**:
  - **[Happy Path]** 정상 생성
    - Response: `200/201` 생성된 객체 (ID 포함)
  - **[CL-01]** 제목(Title) 누락
    - Response: `400 Bad Request`
  - **[CL-02]** 내용(Content) 누락/빈 값
    - Response: `400 Bad Request`
  - **[CL-03]** 내용 구조 오류
    - When: Content 배열 아이템에 question/answer 누락
    - Response: `400 Bad Request`
  - **[D-Ext-02]** 길이 제한 초과
    - When: 내용이 제한된 길이를 초과
    - Response: `400 Bad Request`
  - **[D-Ext-03]** XSS 스크립트 주입 시도
    - When: 내용에 스크립트 태그 포함
    - Response: `400 Bad Request` (Sanitization 또는 거부)

### `GET /document/{documentId}/cover-letter`
**설명**: 자기소개서 상세 내용을 조회합니다.
- **시나리오**:
  - **[Happy Path]** 본인 문서 조회
    - Response: `200 OK` 상세 객체
  - **[CL-04]** 문서 찾을 수 없음
    - Response: `404 Not Found`
  - **[D-Ext-01]** 타인 문서 접근 (IDOR)
    - Given: 다른 유저 소유의 유효한 ID
    - Response: `403 Forbidden` 또는 `404 Not Found`

### `PUT /document/{documentId}/cover-letter`
**설명**: 자기소개서를 수정합니다.
- **시나리오**:
  - **[Happy Path]** 정상 수정
    - Response: `200 OK` 수정된 객체
  - **[CL-06]** 빈 Body 요청
    - Response: `400 Bad Request`
  - **[D-Ext-01]** 타인 문서 수정 시도 (IDOR)
    - Response: `403 Forbidden`

### `DELETE /document/{documentId}/cover-letter`
**설명**: 자기소개서를 삭제합니다.
- **시나리오**:
  - **[Happy Path]** 삭제 성공
    - Response: `204 No Content`
  - **[CL-09]** 멱등성 (이미 삭제된 문서)
    - Response: `404 Not Found` 또는 `204 No Content`

### `POST /document/portfolio/create`
**설명**: 포트폴리오(텍스트)를 생성합니다.
- **요청**: `{ "title": "...", "content": "..." }`
- **시나리오**:
  - **[Happy Path]** 정상 생성
    - Response: `200/201` 생성된 객체
  - **[P-01]** 필수 데이터 누락
    - Response: `400 Bad Request`

---

## 3. 면접 (Interview) - 기술/코딩

### `GET /interview`
**설명**: 면접 목록을 조회합니다.
- **시나리오**:
  - **[Happy Path]** 목록 조회
    - Response: `200 OK`
  - **[I-01]** 잘못된 Type Enum
    - Response: `400 Bad Request`

### `POST /interview/tech/create`
**설명**: 기술 면접을 시작합니다.
- **요청**: `{ "simulationTitle": "...", "documentsIds": [...] }`
- **시나리오**:
  - **[Happy Path]** 면접 시작
    - Response: `200/201` (`interviewId` 및 첫 번째 `question` 포함)
  - **[TI-01]** 제목 누락
    - Response: `400 Bad Request`
  - **[TI-02]** 연동 문서 ID 누락
    - Response: `400 Bad Request`
  - **[TI-Ext-01]** 타인 문서로 생성 시도 (IDOR)
    - Response: `403 Forbidden`
  - **[EXT-01]** 외부 AI 서비스 장애
    - Given: AI 서비스 타임아웃
    - Response: `503 Service Unavailable`

### `POST /interview/tech/question`
**설명**: 다음 면접 질문을 생성합니다.
- **요청**: `{ "interviewId": "..." }`
- **시나리오**:
  - **[Happy Path]** 다음 질문 생성
    - Response: `200 OK` 질문 객체
  - **[TI-04]** 인터뷰 ID 누락
    - Response: `400 Bad Request`
  - **[TI-06]** 종료된 면접
    - Given: 면접 상태가 STOP인 경우
    - Response: `409 Conflict`
  - **[TI-07]** 마지막 질문 이후 요청
    - Given: 이전 질문이 `isLast: true`였음
    - Response: `409 Conflict`
  - **[ST-Ext-01]** 동시 요청 (Race Condition)
    - Given: 동시 다발적 요청
    - Response: 하나만 `200`, 나머지는 `409`

### `POST /interview/stop`
**설명**: 면접을 종료합니다.
- **시나리오**:
  - **[Happy Path]** 종료
    - Response: `200 OK`
  - **[ST-02]** 존재하지 않는 ID / 유효하지 않은 ID
    - Response: `404 Not Found`

### `GET /interview/{id}/feedback`
**설명**: 면접 피드백을 조회합니다.
- **시나리오**:
  - **[Happy Path]** 피드백 조회
    - Response: `200 OK` 점수 및 피드백
  - **[FB-01]** 찾을 수 없음
    - Response: `404 Not Found`

### `POST /interview/feedback`
**설명**: 피드백을 생성합니다.
- **시나리오**:
  - **[Happy Path]** 생성 성공
    - Response: `200 OK`
  - **[FB-04]** 이미 존재함
    - Response: `409 Conflict`

### `GET /interview/{id}/chat/history`
**설명**: 채팅 기록을 조회합니다.
- **시나리오**:
  - **[Happy Path]** 기록 조회
    - Response: `200 OK` 목록
  - **[CH-01]** 찾을 수 없음
    - Response: `404 Not Found`

### `POST /interview/answer/chat`
**설명**: 채팅으로 답변을 제출합니다.
- **시나리오**:
  - **[Happy Path]** 제출 성공
    - Response: `200 OK`
  - **[AC-01]** 빈 답변
    - Response: `400 Bad Request`
  - **[AC-03]** 종료된 면접
    - Response: `409 Conflict`

### `POST /interview/answer/voice`
**설명**: 음성으로 답변을 제출합니다.
- **시나리오**:
  - **[Happy Path]** 파일 제출 성공
    - Response: `200 OK`
  - **[AV-01]** 파일 누락
    - Response: `400 Bad Request`
  - **[AV-02]** 지원하지 않는 포맷 (exe/txt 등)
    - Response: `415 Unsupported Media Type`
  - **[AV-03]** 파일 크기 초과
    - Response: `413 Payload Too Large`
  - **[AV-Ext-01]** 빈 파일 (0KB)
    - Response: `400 Bad Request`

---

## 4. 보안 점검 (공통 사항)
**모든** 보호된 엔드포인트에 적용됩니다.
- **[G-01]** 토큰 없음 -> `401 Unauthorized`
- **[G-02]** 잘못된 토큰 형식 -> `401 Unauthorized`
- **[G-03]** 만료된 토큰 -> `401 Unauthorized`
