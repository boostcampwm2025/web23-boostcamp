-- 1. Users
INSERT INTO users (user_id, user_email, profile_url, created_at, modified_at)
VALUES (1, 'test@example.com', 'https://example.com/profile.jpg', NOW(), NOW());

-- 2. Documents (Cover Letter & Portfolio)
INSERT INTO documents (documents_id, type, title, created_at, user_id)
VALUES (1, 'COVER', 'Frontend Dev Cover Letter', NOW(), 1);

INSERT INTO documents (documents_id, type, title, created_at, user_id)
VALUES (2, 'PORTFOLIO', 'Fullstack Portfolio', NOW(), 1);

-- 3. Cover Letter Details
INSERT INTO cover_letters (cover_letters_id, documents_id)
VALUES (1, 1);

INSERT INTO cover_letters_question_answer (cover_letters_question_answer_id, question, answer, cover_letter_id)
VALUES (1, '지원 동기가 무엇인가요?', '사용자에게 편리한 경험을 제공하는 서비스를 만들고 싶습니다.', 1);

-- 4. Portfolio Details (updated to use content from ENV)
INSERT INTO portfolios (portfolios_id, content, documents_id)
VALUES (1, '개발 스킬/환경
	•	Java: TDD, OOP, MVC 이해 및 적용 / 일급 컬렉션·Enum·record 활용 / 입력 검증·책임 분리 설계
	•	Spring / Spring Boot: MSA 구조 설계, REST API, JPA, 트랜잭션 처리, JWT 인증 구현, WebSocket·SSE 등 실시간 통신 학습/적용
	•	Kafka: Producer–Consumer 구조, Topic·Partition 구성 이해 / KRaft 모드 Kafka 클러스터 구축/운영 경험
	•	Redis: Pub/Sub 기반 메시지 처리 / 싱글 스레드 구조 및 key-value 자료구조 이해·활용
	•	기타: Python(Django/DRF), PostgreSQL·MongoDB, AWS(EC2/RDS/S3/Route53), Docker/Docker-Compose
	•	협업 도구: GitHub, Figma, Notion, StarUML

⸻

프로젝트 요약

1) SmileTogether (2025.01 ~ 2025.03)
	•	역할: 팀장 + 백엔드 개발
	•	목표: 팀 기반 협업용 메신저 플랫폼, 실시간 커뮤니케이션 + 대용량 트래픽 대응
	•	구성/기여
	•	MSA 기반 서버 아키텍처 및 DB 설계
	•	유저(멤버)·이메일 서버 구현, 내부 서비스 간 HTTP 통신(RestTemplate)
	•	WebSocket + STOMP 기반 채팅 기능 개발/고도화, 다중 채팅 서버로 연결 부하 분산
	•	Kafka 메시지 브로커로 다중 채팅 서버 간 동기화
	•	히스토리(메시지 보관) 서버 분리 후 Kafka 기반 채팅 데이터 CRUD 비동기 처리
	•	채널 ID를 Key로 해싱해 동일 파티션 매핑 → 메시지 순서 보장
	•	채팅 데이터 저장에 MongoDB(JSON 문서) 도입
	•	STOMP 인바운드 채널 Interceptor로 디버깅 로그/연동
	•	KRaft 모드 Kafka 클러스터(3 broker + 1 controller) 구성, Kafka UI 활용, Docker-Compose 기반 재현/운영
	•	협업 방식/리딩
	•	데일리 스크럼·코어타임 운영, 업무 분담 및 PMP 문서 작성, PR 알림 자동화 제안

2) FaceFriend (2024.01 ~ 2024.05/06)
	•	역할: 백엔드 개발
	•	프로젝트 소개: AI 이미지 생성/관상 분석 기반의 데이팅 서비스(새로운 매칭 경험)
	•	구성/기여
	•	Spring + AWS(RDS/S3/EC2) 기반 서버 아키텍처 설계/구현
	•	WebSocket + STOMP로 하트 요청/수락·거절 및 채팅 실시간 처리
	•	Redis를 STOMP **외부 메시지 브로커(Pub/Sub)**로 활용
	•	비연결(미접속) 상태 메시지 손실 대응: 사용자 앱 접속 정보 관리 → 접속 여부에 따라 송신/저장 분기, Redis에 저장/관리
	•	채팅방 생성/조회/삭제, 메시지 조회 API 구현
	•	Docker/Docker-Compose로 테스트 환경 구축, AWS 배포
	•	StompHeaderAccessor + JWT Provider로 WebSocket(STOMP) 헤더 JWT 검증/정보 추출

3) OneHabit (2024.03)
	•	역할: 기획 및 백엔드 개발(포트폴리오 서술)
	•	내용
	•	습관 생성/조회/삭제/리스트 API
	•	인증 시 경험치/성장 로직
	•	하루 인증 3회 제한, 중복 인증 처리 방지
	•	매일 자정 인증 데이터 초기화/연속 기록 초기화(스케줄러 활용)

4) Moyeo (2023.07 ~ 2023.08, Django)
	•	Swagger로 API 명세 자동화
	•	모임 CRUD, 등급 자동 승급(크론 기반)
	•	태그 기반 추천 API(필터링/제외 조건/종료일 고려/예외 시 랜덤)
	•	태그 모델 통합 리팩토링

5) Relanz (2023.06 ~ 2023.07, Django)
	•	인증(회원/로그인/로그아웃)
	•	태그 기반 추천, 아바타 커스터마이징, 스코어(랭킹)
	•	Nginx + Gunicorn + EC2 배포

6) KiKi_Kiosk (프로젝트 서술 포함)
	•	요구사항 분석 및 시스템 구조 설계
	•	관리자 로그인/로그아웃 구현
	•	비즈니스 로직 분리 및 유지보수 용이성 향상을 위한 설계 패턴 적용
	•	GRASP 원칙 및 디자인 패턴(Controller/Creator/Expert/Singleton/DTO 등) 적용
	•	AWS EC2 배포, Docker-Compose 기반 간단 배포 환경 구축

⸻

학습/대외활동/협업 경험
	•	S사 Online Dev Camp (2024.10 ~ 2025.11): Java 백엔드 지원(포트폴리오 서술)
	•	W사 부트캠프 프리코스 경험(포트폴리오 서술)
	•	TDD/OOP/MVC 이해 증대 및 적용 시도
	•	Spring 프레임워크 없이 Java만으로 과제 수행하며 Java 자체 학습
	•	Stream/람다 등으로 코드 간결화, 읽기 쉬운 코드에 대한 학습
	•	동아리/해커톤
	•	웹 개발 및 IT 창업 동아리 활동(2023~2024)
	•	교내/중앙 해커톤 참여(2023)
	•	약 40명 규모 동아리 대표(2024)
	•	동아리 연합 해커톤 중앙운영단 참여(2024)
	•	G사 해커톤 2기 활동(2024) 및 약 300명 규모 해커톤 참여(벚꽃톤)

⸻

학력
	•	OO대학교 한국역사학과 학사 (2019~2025) 졸업
	•	OO대학교 소프트웨어전공 학사 (2022~2025) 복수학위 졸업

⸻

논문/수상
	•	논문(2024-06-26, 한국정보과학회 학술발표논문집)
	•	모바일 환경에서 JWT 토큰 관리로 사용자 개인정보 보안
	•	재난 애플리케이션 특성을 고려한 토큰 발급/재발급 과정 서술
	•	토큰 기반 시스템 백엔드 서버 구현 서술
	•	수상
	•	IT 연합 동아리 X OO대 해커톤 금상
	•	2024 한국컴퓨터종합학술대회 학부생/주니어 논문경진대회 장려상
', 1);

-- 5. AI Persona
INSERT INTO ai_persona (persona_id, prompt, name, img_url)
VALUES ('p1', '당신은 날카롭지만 따뜻한 면접관입니다.', 'Tech Interviewer', 'https://example.com/persona.jpg');

-- 6. Interview (Tech Type)
INSERT INTO interviews (interview_id, title, type, created_at, like_status, during_time, user_id)
VALUES (1, 'Boostcamp Web Interview', 'TECH', NOW(), 'NONE', NOW(), 1);

-- 7. Technical Interview Details
INSERT INTO technical_interviews (technical_interviews_id, video_url, feedback_content, interview_id)
VALUES (1, '', '', 1);

-- 8. Interview Documents (Linking Interview to Docs)
-- Link Cover Letter
INSERT INTO interviews_documents (interviews_documents_id, created_at, modified_at, technical_interview_id, documents_id)
VALUES (1, NOW(), NOW(), 1, 1);

-- Link Portfolio
INSERT INTO interviews_documents (interviews_documents_id, created_at, modified_at, technical_interview_id, documents_id)
VALUES (2, NOW(), NOW(), 1, 2);


-- ==========================================
-- Additional Users (Requested)
-- ==========================================

-- User 2: Backend (Java)
INSERT INTO users (user_id, user_email, profile_url, created_at, modified_at)
VALUES (2, 'java_dev@example.com', 'https://example.com/profile_java.jpg', NOW(), NOW());

INSERT INTO documents (documents_id, type, title, created_at, user_id)
VALUES (3, 'PORTFOLIO', 'Java Backend Developer Portfolio', NOW(), 2);

INSERT INTO portfolios (portfolios_id, content, documents_id)
VALUES (2, '기술 스택
	•	Java, Spring Boot, JPA, QueryDSL, MySQL, Redis, AWS
	•	JUnit5, Mockito, Gradle

프로젝트 경험

1) 대규모 이커머스 플랫폼 리팩토링 (2024.06 ~ 2024.12)
	•	역할: 백엔드 리드
	•	내용: 레거시 모놀리식 아키텍처를 MSA로 전환
	•	성과: 주문 처리 속도 50% 향상, 트래픽 피크 시 안정성 확보
	•	상세 기술:
		- Spring Cloud Gateway 및 Eureka 적용
		- Kafka를 이용한 주문-배송 서비스 간 비동기 이벤트 처리
		- Redis 캐싱을 통한 상품 조회 성능 최적화

2) 사내 예약 시스템 고도화 (2023.09 ~ 2024.05)
	•	역할: 백엔드 개발자
	•	내용: 회의실 및 장비 예약 시스템 기능 개선 및 동시성 제어
	•	상세 기술:
		- Redisson 분산 락을 도입하여 중복 예약 문제 해결
		- QueryDSL을 활용한 복잡한 동적 쿼리 구현
', 3);


-- User 3: Backend (Python)
INSERT INTO users (user_id, user_email, profile_url, created_at, modified_at)
VALUES (3, 'python_dev@example.com', 'https://example.com/profile_python.jpg', NOW(), NOW());

INSERT INTO documents (documents_id, type, title, created_at, user_id)
VALUES (4, 'PORTFOLIO', 'Python Backend Developer Portfolio', NOW(), 3);

INSERT INTO portfolios (portfolios_id, content, documents_id)
VALUES (3, '기술 스택
	•	Python, Django, FastAPI, PostgreSQL, Celery, Redis, Docker
	•	Pandas, NumPy (데이터 처리 기초)

프로젝트 경험

1) 실시간 데이터 분석 대시보드 API (2024.03 ~ 2024.09)
	•	역할: 백엔드 개발 및 데이터 파이프라인 구축
	•	내용: IoT 센서 데이터를 수집하여 시각화하는 대시보드 백엔드 구축
	•	상세 기술:
		- FastAPI의 비동기 처리를 활용하여 초당 1000건 이상의 데이터 수집
		- Celery와 Redis를 이용한 무거운 데이터 집계 작업 비동기 처리
		- TimescaleDB (PostgreSQL 확장)를 활용한 시계열 데이터 저장 최적화

2) 소셜 네트워크 서비스 백엔드 (2023.08 ~ 2024.02)
	•	역할: 백엔드 개발자
	•	내용: 사용자 피드 및 알림 기능 구현
	•	상세 기술:
		- Django REST Framework (DRF) 기반 API 설계
		- Django Channels를 이용한 실시간 알림 기능 구현 (WebSocket)
', 4);


-- User 4: Frontend (React/Next.js)
INSERT INTO users (user_id, user_email, profile_url, created_at, modified_at)
VALUES (4, 'frontend_react@example.com', 'https://example.com/profile_react.jpg', NOW(), NOW());

INSERT INTO documents (documents_id, type, title, created_at, user_id)
VALUES (5, 'PORTFOLIO', 'React Frontend Developer Portfolio', NOW(), 4);

INSERT INTO portfolios (portfolios_id, content, documents_id)
VALUES (4, '기술 스택
	•	React, Next.js, TypeScript, TailwindCSS, Recoil, React Query
	•	Storybook, Jest, Testing Library

프로젝트 경험

1) 암호화폐 거래소 모바일 웹 리뉴얼 (2024.05 ~ 2024.11)
	•	역할: 프론트엔드 개발자
	•	내용: 모바일 사용자 경험 최적화를 위한 UI/UX 전면 개편
	•	상세 기술:
		- Next.js의 SSR/ISR을 활용하여 초기 로딩 속도 40% 개선
		- WebSocket을 이용한 실시간 시세 차트 컴포넌트 구현 (Lightweight Charts 활용)
		- Recoil을 이용한 전역 상태 관리 및 테마(Dark Mode) 적용

2) 기업용 랜딩 페이지 빌더 (2023.11 ~ 2024.04)
	•	역할: 프론트엔드 개발자
	•	내용: 드래그 앤 드롭으로 랜딩 페이지를 제작할 수 있는 도구 개발
	•	상세 기술:
		- React DND 라이브러리를 활용한 드래그 앤 드롭 인터페이스 구현
		- 컴포넌트 재사용성을 위한 아토믹 디자인 패턴 적용
', 5);


-- User 5: Frontend (Vue/Nuxt)
INSERT INTO users (user_id, user_email, profile_url, created_at, modified_at)
VALUES (5, 'frontend_vue@example.com', 'https://example.com/profile_vue.jpg', NOW(), NOW());

INSERT INTO documents (documents_id, type, title, created_at, user_id)
VALUES (6, 'PORTFOLIO', 'Vue Frontend Developer Portfolio', NOW(), 5);

INSERT INTO portfolios (portfolios_id, content, documents_id)
VALUES (5, '기술 스택
	•	Vue.js 3, Nuxt.js, Pinia, Sass(SCSS), Vuetify
	•	Cypress (E2E Test)

프로젝트 경험

1) 물류 관리 어드민 대시보드 (2024.02 ~ 2024.08)
	•	역할: 프론트엔드 개발자
	•	내용: 복잡한 물류 데이터를 관리하고 시각화하는 내부 시스템 구축
	•	상세 기술:
		- Vue 3 Composition API를 활용한 로직 재사용성 증대
		- Ag-Grid와 같은 고성능 데이터 그리드 라이브러리 커스터마이징
		- Pinia를 활용한 효율적인 상태 관리 및 모듈화

2) 개발자 커뮤니티 포럼 (2023.07 ~ 2024.01)
	•	역할: 프론트엔드 개발자
	•	내용: 마크다운 에디터와 댓글 기능을 포함한 커뮤니티 사이트 개발
	•	상세 기술:
		- Nuxt 3를 이용한 SEO 최적화 및 서버 사이드 렌더링
		- Toast UI Editor 커스터마이징 및 이미지 업로드 처리
', 6);


-- User 6: Fullstack (Node/JS/TS)
INSERT INTO users (user_id, user_email, profile_url, created_at, modified_at)
VALUES (6, 'fullstack_js@example.com', 'https://example.com/profile_fullstack.jpg', NOW(), NOW());

INSERT INTO documents (documents_id, type, title, created_at, user_id)
VALUES (7, 'PORTFOLIO', 'Fullstack Developer Portfolio', NOW(), 6);

INSERT INTO portfolios (portfolios_id, content, documents_id)
VALUES (6, '기술 스택
	•	JavaScript(ES6+), TypeScript, Node.js, NestJS, React, MongoDB
	•	Express, Mongoose, Socket.io

프로젝트 경험

1) 실시간 협업 화이트보드 서비스 (2024.04 ~ 2024.10)
	•	역할: 풀스택 개발 (개인 프로젝트)
	•	내용: 여러 사용자가 동시에 그림을 그리고 채팅할 수 있는 웹 서비스
	•	상세 기술:
		- (BE) NestJS + Socket.io gateway를 이용한 실시간 양방향 통신 구현
		- (FE) HTML5 Canvas API 및 React를 활용한 드로잉 보드 구현
		- (DB) MongoDB Atlas를 이용한 드로잉 히스토리 저장 (비정형 데이터 처리)

2) 기술 블로그 플랫폼 (2023.10 ~ 2024.03)
	•	역할: 풀스택 개발자
	•	내용: Next.js 기반의 프론트엔드와 NestJS 기반의 백엔드를 통합한 블로그
	•	상세 기술:
		- Monorepo(Turborepo) 환경 구축하여 FE/BE 코드 통합 관리
		- JWT 기반 인증/인가 시스템 구현 (Access/Refresh Token)
', 7);


-- User 7: DevOps
INSERT INTO users (user_id, user_email, profile_url, created_at, modified_at)
VALUES (7, 'devops@example.com', 'https://example.com/profile_devops.jpg', NOW(), NOW());

INSERT INTO documents (documents_id, type, title, created_at, user_id)
VALUES (8, 'PORTFOLIO', 'DevOps Engineer Portfolio', NOW(), 7);

INSERT INTO portfolios (portfolios_id, content, documents_id)
VALUES (7, '기술 스택
	•	AWS, Docker, Kubernetes, Jenkins, GitHub Actions, Terraform
	•	Prometheus, Grafana, ELK Stack, Linux(Ubuntu/CentOS)

프로젝트 경험

1) 금융 서비스 클라우드 마이그레이션 및 자동화 (2024.01 ~ 2024.07)
	•	역할: DevOps 엔지니어
	•	내용: 온프레미스 환경의 서비스를 AWS 클라우드 환경으로 이관 및 파이프라인 구축
	•	상세 기술:
		- Terraform(IaC)을 활용한 AWS 인프라(VPC, EC2, RDS, EKS) 프로비저닝 자동화
		- Jenkins 기반의 CI/CD 파이프라인 구축 (Blue/Green 배포 전략 적용)
		- Kubernetes(EKS) 클러스터 구축 및 MSA 서비스 배포 관리

2) 모니터링 시스템 통합 구축 (2023.05 ~ 2023.12)
	•	역할: DevOps 엔지니어
	•	내용: 서비스 장애 감지 및 성능 모니터링을 위한 통합 관제 시스템 구축
	•	상세 기술:
		- Prometheus + Grafana를 이용한 시스템 리소스(CPU, Memory) 및 애플리케이션 메트릭 시각화
		- ELK Stack (Elasticsearch, Logstash, Kibana)을 이용한 중앙 집중형 로그 관리 시스템 구축
', 8);
