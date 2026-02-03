-- Clean Test Data (No Questions/Answers)

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
	•	Smilegate Online Dev Camp (2024.10 ~ 2025.11): Java 백엔드 지원(포트폴리오 서술)
	•	우아한테크코스 프리코스 경험(포트폴리오 서술)
	•	TDD/OOP/MVC 이해 증대 및 적용 시도
	•	Spring 프레임워크 없이 Java만으로 과제 수행하며 Java 자체 학습
	•	Stream/람다 등으로 코드 간결화, 읽기 쉬운 코드에 대한 학습
	•	동아리/해커톤
	•	웹 개발 및 IT 창업 동아리(멋쟁이사자처럼) 활동(2023~2024)
	•	교내/중앙 해커톤 참여(2023)
	•	약 40명 규모 동아리 대표(2024)
	•	동아리 연합 해커톤 중앙운영단 참여(2024)
	•	Goormthon Univ 2기 활동(2024) 및 약 300명 규모 해커톤 참여(벚꽃톤)

⸻

학력
	•	국민대학교 한국역사학과 학사 (2019~2025) 졸업
	•	국민대학교 소프트웨어전공 학사 (2022~2025) 복수학위 졸업

⸻

논문/수상
	•	논문(2024-06-26, 한국정보과학회 학술발표논문집)
	•	모바일 환경에서 JWT 토큰 관리로 사용자 개인정보 보안
	•	재난 애플리케이션 특성을 고려한 토큰 발급/재발급 과정 서술
	•	토큰 기반 시스템 백엔드 서버 구현 서술
	•	수상
	•	멋쟁이사자처럼 X 국민대 해커톤 금상
	•	2024 한국컴퓨터종합학술대회 학부생/주니어 논문경진대회 장려상
', 2);

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

-- Note: interviews_questions and interviews_answers are intentionally left empty.
