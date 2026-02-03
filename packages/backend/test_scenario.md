요청하신 내용을 바탕으로 **기존 시나리오**와 **추가된 엣지/보안 시나리오**를 통합하여 문서화했습니다.
이 문서는 QA 체크리스트, 테스트 코드(Spec) 작성의 기초 자료, 또는 팀 내 API 명세 검증 문서로 활용하실 수 있습니다.

---

# 🧪 API Negative & Edge Case Test Scenarios

이 문서는 API의 예외 처리(Negative Testing), 보안 취약점(Security), 그리고 엣지 케이스(Edge Case)를 검증하기 위한 시나리오를 **Given / When / Then** 형식으로 정의합니다.

> **범례**
> * 🟢 **Pass**: 테스트 통과
> * 🔴 **Fail**: 테스트 실패 (버그 리포팅 필요)
> * ⚪ **Skip**: 미구현 또는 보류
> 
> 

---

## 1. 공통 (Global Standards)

*모든 API 엔드포인트에 공통적으로 적용되는 규칙입니다.*

* [ ] **G-01 인증 토큰 없음**
* **Given** 보호된 API 호출에 필요한 인증 토큰이 없다
* **When** `Authorization` 헤더 없이 요청한다
* **Then** `401 Unauthorized`를 반환한다


* [ ] **G-02 인증 토큰 형식 오류**
* **Given** 보호된 API 호출에 필요한 인증 토큰이 있다
* **When** `Authorization: Bearer <token>` 형식이 아닌 헤더로 요청한다
* **Then** `401 Unauthorized`를 반환한다


* [ ] **G-03 인증 토큰 만료/위조**
* **Given** 만료되었거나 위조된 토큰이 있다
* **When** 보호된 API를 호출한다
* **Then** `401 Unauthorized`를 반환한다


* [ ] **G-04 권한 없음 (Role Mismatch)**
* **Given** 일반 유저로 로그인했다
* **When** 관리자 전용 API(`POST /admin/*`, `/users` 등)를 호출한다
* **Then** `403 Forbidden`를 반환한다


* [ ] **G-05 Path Parameter 형식 오류**
* **Given** Path param이 특정 형식(숫자/UUID 등)을 기대한다
* **When** 형식이 맞지 않는 param으로 요청한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **G-06 존재하지 않는 리소스**
* **Given** 존재하지 않는 `{id}` (documentId, interviewId 등)가 있다
* **When** 해당 리소스를 조회/수정/삭제한다
* **Then** `404 Not Found`를 반환한다


* [ ] **G-07 페이징 파라미터 오류**
* **Given** 리스트 API는 `page`, `take`를 사용한다
* **When** `page<=0` 또는 `take<=0` 등 유효하지 않은 값으로 요청한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **G-08 Enum 파라미터 오류**
* **Given** enum 값이 정해져 있다 (`type`, `sort`, `like` 등)
* **When** 허용되지 않는 enum 값으로 요청한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **G-09 Content-Type 불일치**
* **Given** JSON body를 기대하는 API가 있다
* **When** Content-Type을 올바르게 지정하지 않고 요청한다 (예: text/plain)
* **Then** `415 Unsupported Media Type` 또는 `400 Bad Request`를 반환한다


* [ ] **G-10 Body 필수 필드 누락**
* **Given** 요청 body에 필수 필드가 있다
* **When** 필수 필드를 누락한 요청을 보낸다
* **Then** `400 Bad Request`를 반환한다



---

## 2. 인증 (Auth)

* [ ] **A-01 로그인 요청 필드 누락**
* **Given** 로그인 API는 자격증명 필드를 요구한다
* **When** 필수 필드를 누락한 body로 `POST /auth/login`을 호출한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **A-02 잘못된 자격증명**
* **Given** 존재하는 계정의 올바르지 않은 비밀번호가 있다
* **When** `POST /auth/login`을 호출한다
* **Then** `401 Unauthorized`를 반환한다


* [ ] **A-03 존재하지 않는 사용자**
* **Given** 존재하지 않는 계정 정보가 있다
* **When** `POST /auth/login`을 호출한다
* **Then** `401 Unauthorized` (보안상 404 대신 401 권장)를 반환한다



---

## 3. 사용자 관리 (Users - Admin)

* [ ] **U-01 일반 유저의 전체 유저 목록 접근**
* **Given** 일반 유저로 로그인했다
* **When** `GET /users`를 호출한다
* **Then** `403 Forbidden`를 반환한다


* [ ] **U-02 전체 유저 목록 페이징 오류**
* **Given** 관리자 권한으로 로그인했다
* **When** `GET /users?page=0&take=0` 등 유효하지 않은 쿼리로 호출한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **U-03 유저 단건 조회 - 존재하지 않는 ID**
* **Given** 관리자 권한으로 로그인했다
* **When** 존재하지 않는 `{user_id}`로 `GET /users/{user_id}`를 호출한다
* **Then** `404 Not Found`를 반환한다



---

## 4. 문서 (Document - Cover Letter & Portfolio)

### 공통 조회

* [ ] **D-01 문서 목록 조회 - Type Enum 오류**
* **When** `GET /document?type=INVALID` 로 호출한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **D-02 문서 목록 조회 - Sort Enum 오류**
* **When** `GET /document?sort=INVALID` 로 호출한다
* **Then** `400 Bad Request`를 반환한다



### 자기소개서 (Cover Letter)

* [ ] **CL-01 생성 - Title 누락**
* **When** title 없이 `POST /document/cover-letter/create`를 호출한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **CL-02 생성 - Content 누락/빈 배열**
* **When** content가 없거나 빈 배열로 요청한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **CL-03 생성 - Content 구조 오류**
* **When** `{question, answer}` 구조가 깨진 원소로 요청한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **CL-04 조회 - 존재하지 않는 DocumentId**
* **When** `GET /document/{documentId}/cover-letter`를 호출한다
* **Then** `404 Not Found`를 반환한다


* [ ] **CL-06 수정 - 변경 데이터 없음**
* **When** title, content 둘 다 없는 Body로 수정 요청한다
* **Then** `400 Bad Request`를 반환한다


* [ ] **CL-09 삭제 - 멱등성 확인**
* **Given** 이미 삭제된 문서 ID
* **When** 다시 삭제 요청을 보낸다
* **Then** `404 Not Found` 또는 `204 No Content`



### 포트폴리오 (Portfolio)

* [ ] **P-01 생성 - 필수 데이터 누락**
* **When** title 또는 content 누락 후 `POST /document/portfolio/create`
* **Then** `400 Bad Request`



### 🛡️ 보안 및 엣지 케이스 (Extended)

* [ ] **D-Ext-01 타인의 문서 접근 (IDOR)**
* **Given** User A 로그인, User B의 문서 ID 보유
* **When** User A가 B의 문서를 조회/수정/삭제 시도
* **Then** `403 Forbidden` 또는 `404 Not Found`


* [ ] **D-Ext-02 입력 길이 초과**
* **Given** DB 컬럼 제한(예: 5000자)을 넘는 데이터
* **When** 문서 생성/수정 요청
* **Then** `400 Bad Request`


* [ ] **D-Ext-03 XSS 스크립트 주입**
* **Given** `<script>alert(1)</script>` 포함된 내용
* **When** 문서 저장 요청
* **Then** 저장 시 차단(`400`)하거나 조회 시 이스케이프 처리 확인



---

## 5. 면접 (Interview - Tech)

### 기본 및 목록

* [ ] **I-01 면접 리스트 - Type Enum 오류**
* **When** `GET /interview?type=INVALID`
* **Then** `400 Bad Request`



### 기술 면접 (Tech Interview)

* [ ] **TI-01 생성 - SimulationTitle 누락**
* **When** title 없이 `POST /interview/tech/create`
* **Then** `400 Bad Request`


* [ ] **TI-02 생성 - DocumentIds 누락**
* **When** 연동할 문서 ID 배열 누락
* **Then** `400 Bad Request`


* [ ] **TI-04 질문 생성 - InterviewId 누락**
* **When** `POST /interview/tech/question` (Body에 ID 누락)
* **Then** `400 Bad Request`


* [ ] **TI-06 질문 생성 - 이미 종료된 면접**
* **Given** `STOP` 상태인 면접
* **When** 질문 생성 요청
* **Then** `409 Conflict` 또는 `400 Bad Request`


* [ ] **TI-07 질문 생성 - 마지막 질문 이후**
* **Given** `isLast=true` 응답을 받은 후
* **When** 추가 질문 생성 요청
* **Then** `409 Conflict`



### 🛡️ 보안 및 엣지 케이스 (Extended)

* [ ] **TI-Ext-01 타인의 문서로 면접 생성 (IDOR)**
* **Given** User A 로그인, User B의 문서 ID
* **When** B의 문서로 면접 생성 시도
* **Then** `403 Forbidden`


* [ ] **TI-Ext-02 답변 중복 제출**
* **Given** 이미 답변 완료한 질문
* **When** 다시 답변 제출 요청
* **Then** `409 Conflict`


* [ ] **TI-Ext-03 LLM 컨텍스트 초과**
* **Given** 대화 히스토리가 매우 긴 상태
* **When** 질문 생성 요청 (Context Window 초과)
* **Then** `422 Unprocessable Entity` (또는 적절한 에러 핸들링)


* [ ] **EXT-01 외부 AI 서비스 장애**
* **Given** OpenAI/Clova 타임아웃
* **When** AI 의존 API 호출
* **Then** `503 Service Unavailable`



---

## 6. 피드백 및 종료 (Feedback & Lifecycle)

* [ ] **FB-01 피드백 조회 - 존재하지 않는 면접**
* **When** `GET /interview/{id}/feedback`
* **Then** `404 Not Found`


* [ ] **FB-04 피드백 중복 생성**
* **Given** 이미 피드백이 생성된 면접
* **When** 다시 생성 요청
* **Then** `409 Conflict`


* [ ] **ST-02 면접 종료 - 존재하지 않는 면접**
* **When** `POST /interview/stop` (Invalid ID)
* **Then** `404 Not Found`


* [ ] **TM-01 진행 시간 조회 - 존재하지 않는 면접**
* **When** `GET /interview/{id}/time`
* **Then** `404 Not Found`



---

## 7. 채팅 및 미디어 (Chat & Voice)

### 채팅/히스토리

* [ ] **CH-01 히스토리 조회 - 존재하지 않는 ID**
* **When** `GET /interview/{id}/chat/history`
* **Then** `404 Not Found`


* [ ] **AC-01 채팅 답변 - 필수 필드 누락**
* **When** answer 텍스트 없이 전송
* **Then** `400 Bad Request`


* [ ] **AC-03 채팅 답변 - 종료된 면접**
* **When** 종료된 면접에 답변 전송
* **Then** `409 Conflict`



### 음성 답변 (Voice)

* [ ] **AV-01 음성 답변 - 파일 누락**
* **When** `file` 파트 없이 요청
* **Then** `400 Bad Request`


* [ ] **AV-02 음성 답변 - 지원하지 않는 포맷**
* **When** `.exe`, `.txt` 등 허용되지 않는 파일 업로드
* **Then** `415 Unsupported Media Type`


* [ ] **AV-03 음성 답변 - 파일 크기 초과**
* **Given** 제한 용량(예: 10MB) 초과 파일
* **When** 업로드 요청
* **Then** `413 Payload Too Large`



### 🛡️ 파일 및 동시성 엣지 케이스 (Extended)

* [ ] **AV-Ext-01 빈 파일 업로드**
* **Given** 0 byte 파일
* **When** 업로드 요청
* **Then** `400 Bad Request`


* [ ] **AV-Ext-02 파일 확장자 위조 (Mime Spoofing)**
* **Given** 실제는 바이너리 파일이나 확장자만 `.mp3`
* **When** 업로드 요청
* **Then** `400 Bad Request` (매직 넘버 검증)


* [ ] **ST-Ext-01 동시 질문 생성 요청 (Race Condition)**
* **Given** 네트워크 지연 상황
* **When** `POST question` 요청이 동시에 2개 도달
* **Then** 1개 성공, 나머지 `409 Conflict` (DB 트랜잭션/Lock)



---

## 8. 미구현 기능 (Future Scope)

* [ ] **ID-01 면접 상세 조회** (`GET /interview/:id`) -> `501` or `404`
* [ ] **LK-01 좋아요 등록** (`POST /interview/like`) -> `501` or `404`