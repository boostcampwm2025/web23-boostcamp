
import * as fs from 'fs';
import * as path from 'path';

// Manually load .env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const SYSTEM_PROMPT = `
# Role
10년 차 시니어 개발자 면접관. 주니어 지원자의 '기술적 깊이(User vs Engineer)' 검증.
- 검증 흐름: 경험 → 근거/트레이드오프 → 검증/디버깅(동작 원리).
- 목표: 단순 사용 경험을 넘어 원리 이해도와 문제 해결 능력 확인.

# Primary Directives (최우선 준수 사항)
1. 중복 주제 절대 금지 (Highest Priority):
   - [제외된 주제]에 포함된 키워드, 기술, 개념에 대한 질문은 절대 금지.
   - 꼬리 질문이라 하더라도, 이미 논의된 [제외된 주제]로 되돌아가지 말 것.
   - 최근 대화 내역에 있는 질문을 절대로 반복해서 질문하지 말 것.
2. Force Switch (즉시 주제 전환) 필수:
   - 지원자가 **"모름", "경험 없음", "잘 모르겠습니다"** 등의 부정적 답변을 하거나,
   - 답변의 깊이가 얕아 더 이상 질문할 것이 없다고 판단되면,
   - **즉시** 현재 주제를 종료하고 [제외된 주제]에 없는 **완전히 새로운 주제(Scenario A)** 로 전환하라.
   - 절대 아는 척 넘어가거나 설명을 유도하지 말 것.
3. Context Alignment (맥락 일치 및 중복 질문 방지):
   - **Critical**: 지원자가 답변에서 이미 언급한 키워드나 내용을 "사용했나요?" 혹은 "무엇인가요?"라고 다시 묻지 말 것.
   - 이미 언급된 내용은 **'이미 알고 있는 사실(Fact)'**로 간주하고, 그 **Why(이유), How(구체적 구현), Trade-off(대안 비교)**를 묻는 심층 질문으로 즉시 넘어갈 것.
   - 충분히 물어봤다고 판단되면, 즉시 주제를 전환할 것
   - 예시:
     - 답변: "Kakfa를 사용해 비동기 처리를 구현했습니다."
     - 나쁜 질문 (X): "Kafka를 사용하셨나요?", "Kafka가 무엇인가요?"
     - 좋은 질문 (O): "Kafka 외에 RabbitMQ 같은 대안도 있었을 텐데, 왜 Kafka를 선택했나요?"

# Critical Guidelines
1. 단순 정의 금지: "A란 무엇인가?" 금지. 동작 흐름/실행 순서/예외 추론을 물을 것.
2. Deep Dive (심층 검증): 답변이 모호하면 즉시 근거(수치), 대안, 검증(로그/지표) 요구.
3. Tags 관리: 질문의 핵심 키워드(기술/개념) 2~3개 추출. (다음 턴 제외 주제로 사용)
4. 종료 조건: (누적 Unique Tags + 현재 Tags) ≥ 20개면 isLast: true.

# Scenarios
상황에 따라 아래 전략 중 하나를 선택.

## Scenario A. 새 주제 시작 (New Topic Router)
Trigger: 대화 시작, Force Switch 조건 달성, 최근 대화에서 꼬리 질문 3회 이상 진행 시.
Action: [제외된 주제]에 **없는** 새로운 토픽을 선정하여 질문.
- A1. 프로젝트 기반 (Project-Based):
  - 이력서의 특정 프로젝트/기술 지목.
  - 필수 포함: 기술 선택 이유(대안 비교), 설정 근거(트레이드오프), 장애 극복 사례 중 택 1.
- A2. 언어/런타임 기본기 (Language/Runtime):
  - 이력서 내 언어/프레임워크 지목.
  - 방향: 정의가 아닌 동작 원리, 실행 순서, 동시성 이슈 추론.

## Scenario B. 심층 꼬리 질문 (Deep Dive)
Trigger: 답변은 타당하나 깊이/근거가 부족할 때.
- **[제외된 주제]와 겹치지 않는 선에서** 깊이를 더함.
- 방향: 트래픽 부하 가정, 정합성/순서 보장 실패 모드, 엣지케이스, 검증 방법.

## Scenario C. CS/원리 연결 (CS Bridge)
Trigger: 단순 사용 경험('User' level)에 그치거나 자동화된 동작 이해가 의심될 때.
- 기술을 CS 원리(OS, Network, DB)와 연결.

# Output Format (JSON Only)
마크다운 없이 오직 JSON만 출력.
{
  "question": "지원자에게 던질 구체적 질문 (존댓말)",
  "tags": ["핵심키워드1", "핵심키워드2"],
  "isLast": true // boolean 필드
}

# Self-Check (Internal)
- 생성된 question이 [제외된 주제]를 포함하는가? -> 즉시 폐기하고 다시 생성.
- 지원자가 모른다고 했는가? -> 즉시 다른 주제로 전환했는가 확인.
- question이 빈값이지는 않은가?
`;

const USER_INFO = `
임장혁
이메일: qkdrhkgn23@naver.com
Github: https://github.com/imjanghyeok
안녕하세요, AI를 활용하더라도 내가 설명할 수 있는 코드만을 개발하고자 하는 백엔드 개발
자 임장혁입니다.
개발 스킬 및 환경
주요 개발 기술:
Java (학교 수업 1개, 개인 학습 1년 / OOP, MVC 패턴에 대한 이해, Enum·record 활용
및 학습, 입력 검증 및 책임 분리 설계 및 구현)
Spring / Spring Boot (학습 1년, 프로젝트 3개 / MSA 구조 설계, REST API, JPA, 트랜
잭션 처리에 대한 이해, JWT 인증 이해 및 구현, WebSocket·SSE 등 실시간 통신 방법 학
습)
javascript / typescript (node.js / 학습 6개월, 부스트캠프 웹‧모바일 10기 챌린지 과정
및 멤버십 과정 진행, 이벤트 루프에 대한 이해, blocking I/O와 non-blocking I/O를 이해)
Kafka (프로젝트 1개 / Producer-Consumer 구조 및 Topic·Partition 구성에 대한 이해,
Kafka Cluster[KRaft 모드] 구축 및 학습)
Redis (프로젝트 2개 / Pub/Sub 메시지 처리, 싱글 스레드 구조 및 key-value 자료구조
이해 및 활용)
이외 개발 기술:
Back-End: Python , Django , DRF
Database: JPA , PostgreSQL , MongoDB
DevOps: AWSEC2, RDS, S3, Route53 , Docker , Docker-Compose
CollaborationTool: GitHub , Figma , Notion , StarUML
프로젝트
SmileTogether 2025.01  2025.03
역할: 팀장 및 Backend 개발
임장혁 1

프로젝트 소개: 팀 기반 협업을 위한 메신저 중심의 플랫폼으로, 실시간 커뮤니케이션과 대
용량 트래픽을 보장하는 서버를 목표.
협업 방식: 오전까지 데일리 스크럼 내용 공유, 코어타임 전 데일리 스크럼 진행, 코어타임 진
행
기여도:
PM 50%
팀장으로서 업무 분담 및 PMP 문서를 작성했습니다.
코어 타임 지정하고, 상황 공유를 위한 데일리 스크럼을 진행했습니다.
디스코드와 PR 생성 및 머지 여부에 대한 알림을 설정하여, 업무 보고 자동화를 제안했
습니다.
Backend 70%
개발시에 주로 ChatGPT를 활용하여 설계 및 구현을 했습니다. (설계 및 구현 과정에서
GPT를 활용하여 학습 진행)
MSA 기반의 서버 아키텍처 및 DB 설계했습니다.
멤버 및 이메일 서버 구현을 통해 유저 관련 기능을 구현했습니다.
WebSocket과 Stomp 프로토콜을 이용한 채팅 기능 개발 및 고도화, 다중 채팅 서버를
통한 WebSocket 연결에 대한 부하를 분산시켰습니다.
Kafka를 메시지 브로커로 이용하여, 다중 채팅 서버간 동기화를 구현했습니다.
Kafka의 안정적인 운영을 위해 Kraft 모드를 도입하여 Kafka Cluster 구축했습니다.
프론트엔드 테스트를 위해 Docker와 Docker-compose를 이용하여 테스트 환경을 구
축했습니다.
활용 기술: Java , Spring , Spring Boot , PostgreSQL , Docker , Docker-compose , Stomp , Kafka ,
MongoDB
링크: https://github.com/sgdevcamp2025/smiletogether
FaceFriend 2024.01  2024.05
역할: Backend 개발
프로젝트 소개: AI 기반 이미지 생성 및 관상 분석 기능을 도입하여, 사용자가 기존 데이팅 앱
과는 다른 새로운 매칭 경험을 얻을 수 있도록 개발한 데이팅 서비스.
협업 방식: 매주 2회(월, 금)의 정기 회의, 정기 회의 후 수업 중에 받은 피드백 정리하는 시
간을 따로 가짐.
임장혁 2

기여도:
기획 25%
회의록 작성 및 2주 단위의 개인 회고를 진행했습니다.
관상 분석 등 재미 요소 제안, 관상 관련 논문 등을 조사하여 공유했습니다.
‘얼굴을 불특정다수에게 보여주기가 부담스럽다ʼ 등 문제를 정의했습니다.
Backend 50%
Spring과 AWS RDS, S3, EC2 등을 이용하여 서버 아키텍처를 설계 및 구현했습니다.
WebSocket과 STOMP 프로토콜을 이용하여 실시간 하트(채팅 수락 여부) 요청 및 거
절, 채팅 기능을 개발했습니다.
Redis를 이용하여, STOMP 외부 메시지 브로커를 구현했습니다.
채팅방 조회, 생성, 삭제 및 채팅 메시지 조회 API를 구현했습니다.
비연결 상태 메시지 손실 처리:
DB 트랜젝션이 다수 일어날 것을 대비하여 접속 정보, 손실되는 메시지 등은 Redis
를 통해 저장 및 관리했습니다.
Docker와 Docker-compose를 이용하여 테스트 환경을 구축하고 AWS를 통해 서버
를 배포했습니다.
Stomp Header Accesser와 JWT Provider를 이용하여, JWT 토큰 검증 및 정보 추
출 기능을 구현했습니다.
활용 기술: Java , Spring , Spring Boot , PostgreSQL , AWSEC2, RDS , Docker , Docker-Compose ,
STOMP
링크: https://github.com/kookmin-sw/capstone-202418
OneHabit 2024.03
역할: Backend 개발
프로젝트 소개: 습관 형성이 어려운 대학생, 직장인들을 위해 하나의 습관을 제대로 형성할
수 있도록 돕고, 자신만의 나무를 가꾸어 이를 공유하는 방식으로 함께 성장할 수 있는 환경
을 제공하고자 개발한 서비스.
협업 방식: 매일 밤 9~11시 사이에 모든 일정이 종료 후, 회의를 진행. 회의는 안건에 대한 결
론 존재 유무에 따라 종료.
기여도:
임장혁 3

기획 및 PM 50%
회의에서 페르소나 정의, 서비스 한 줄 정의, 문제 정의 등 회의 의제에 대해 발의하며, 회
의를 주도했습니다.
서비스의 문제 정의 및 문제 정의를 위한 5가지 “왜ˮ라는 꼬리 질문을 통해 서비스 정립
했습니다. (5 Whys 방법 활용)
서비스에 필요한 기능 명세를 정리 후, Best Case에 따른 유저 플로우를 작성했습니다.
Backend 40%
습관 생성, 조회, 삭제, 리스트 API를 작성했습니다. (JPA 활용)
습관 생성 후 활동 인증에 대한 API를 작성했습니다.
사용자가 특정 습관을 인증하면 경험치 부여 및 성장 로직을 적용시켰습니다.
최대 하루 3회 인증 제한 기능 및 이미 인증된 습관에 대한 중복 처리 방지 기능을 구현
했습니다.
매일 자정 자동으로 사용자 인증 데이터를 초기화하고, 인증이 진행되지 않은 습관에 대
해 연속 기록 초기화 처리 기능을 구현했습니다. (스케줄러 Annotation 활용)
활용 기술: Java , Spring , Spring Boot , PostgreSQL , AWSEC2
링크: https://github.com/9oormthon-univ/2024_BEOTKKOTTHON_TEAM_19_BE
Moyeo 2023.07  2023.08
역할: Backend 개발
프로젝트 소개: 디지털 기기를 자연스럽게 다룰 수 있도록 액티브 시니어를 대상으로 모임
전제의 공동구매를 제공하는 것을 목표로한 이커머스 플랫폼.
협업 방식: 화상 회의 플랫폼에 접속하여, 회의 및 개발 진행.
기여도:
기획 20%
2022 디지털정보격차 보고서, 디지털정보격차실태조사 보고서 등 기획에 대한 자료 조
사 및 분석에 참여했습니다.
네이버 밴드 등 시니어들이 주로 이용하는 SNS를 참고하여 ‘모임ʼ 기반으로 하자는 아
이디어를 제공했습니다.
Backend 50%
Swagger를 적용하여 API 명세 자동화 및 프론트엔드 협업 효율성을 향상시켰습니다.
임장혁 4

모임 생성·조회·수정·삭제 API 및 모임 등급 자동 승급 기능 구현 했습니다. (Crontab
기반 스케줄러 적용)
클럽 태그 기반 상품 추천 API 개발: 유사 태그 필터링, 클럽 보유 상품 제외, 공구 종료
일 고려, 예외 시 랜덤 추천 로직을 설계 및 구현했습니다.
태그 모델 통합 및 구조 리팩토링을 통해 추천 로직 단순화 및 유지보수성 개선했습니다.
알림 내역 조회용 API 구현, Docker 기반 개발 환경을 구성했습니다.
Docker-compes 파일 및 관련 설정 파일을 수정하여, 배포 과정 중 초기 데이터를 넣는
작업 자동화를 구현했습니다.
활용 기술: Python , Django , DRF , Docker , Docker-Compose , NCPNaver Cloud Paltform)
링크: https://github.com/CalmCrews/silver_backend
Relanz 2023.06  2023.07
역할: Backend 개발
프로젝트 소개: 개개인에 맞는 스트레스 관리법을 추천하는 것을 목표로 하는 챌린지 플랫
폼.
협업 방식: 화상 회의 플랫폼에 접속하여, 회의 및 개발을 진행.
기여도:
Backend 75%
회원가입 및 로그인, 로그아웃 등 User 및 인증 기능을 구현했습니다.
유저에게 추천하기 위한 챌린지 태그 및 유저의 태그 기능을 구현했습니다.
User의 아바타를 Customize 할 수 있는 기능을 구현했습니다.
랭킹을 따질 수 있는 스코어 기능을 구현했습니다.
설문을 통하여 또는 참여한 활동의 태그를 조사하여 DB 정보를 통해 활동을 추천하는
추천시스템을 구현했습니다.
Nginx, Gunicorn, AWS EC2을 이용하여 배포 및 도메인 연결을 했습니다.
활용 기술: Python , Django , AWSEC2 , NginX , Gunicorn
링크: https://github.com/CalmCrews/Relanz
학습 (학교 강의 프로젝트)
KiKi_Kiosk 2024.03  2024.06
임장혁 5

역할: Backend 개발
프로젝트 소개: 키오스크 주문에 어려움을 느끼는 정보 취약계층(ex.노년층)을 위해 주문 단
계를 하나씩 나눠 마치 점원과 대화를 나누듯 주문을 진행할 수 있는 키오스크 애플리케이션
프로젝트 목표:
객체지향분석 및 설계에 학습한 내용을 바탕으로 프로젝트를 진행
 Use Case 작성
 시퀀스 다이어그램 작성
 시스템 시퀀스 다이어그램 작성
 클래스 다이어그램 작성
도메인 모델 설계부터 시퀀스/클래스 다이어그램까지 전체 소프트웨어 설계 프로세스를
실습
작업 내용:
Use Case / 시퀀스 / 시스템 시퀀스 / 클래스 다이어그램 작성을 통해 기능 요구사항 분
석 및 시스템 구조 설계
관리자 로그인/로그아웃 기능 구현
비즈니스 로직 분리 및 유지보수 용이성 향상을 위한 설계 패턴 적용
GRASP 원칙 및 디자인 패턴 (Controller, Creator, Expert, Singleton, DTO 등)
적용
AWS EC2 배포 및 Docker-Compose를 활용한 간단한 배포 환경 구축
활용 기술: Java , Spring , Spring Boot , AWSEC2 , Docker , Docker-Compose
링크: https://github.com/imjanghyeok/kiki_kiosk
논문
애플리케이션 내 토큰 관리를 통해 사용자 개인정보 보안. 한국정보과학회 학술발표논문집,
제주.
김유림, 임장혁, 김우림, 서의정, 신은영, 최유찬. (2024-06-26).
모바일 환경의 앱 애플리케이션 내에서 JWT 토큰 관리를 통한 사용자 개인정보에 대한
보안
재난 애플리케이션이라는 특징을 고려한 JWT 토큰 발급 및 재발급 과정 저술
임장혁 6

토큰 기반 시스템의 백엔드 서버 구현
수상
- 멋쟁이사자처럼 X 국민대 해커톤 금상 수상
- 2024 한국컴퓨터종합학술대회 학부생/주니어 논문경진대회 장려상
활동
국민대학교 한국역사학과 학사 (2019~2025)
한국역사학과 졸업
국민대학교 소프트웨어전공 학사 (2022 - 2025)
소프트웨어전공을 복수 학위자로 졸업
웹 개발 및 IT 창업 동아리 [멋쟁이사자처럼] 국민대 (2023 ~ 2024)
국민대 멋쟁이사자처럼 교내 해커톤 및 전국 멋쟁이사자처럼 중앙 해커톤 참
여 (2023)
40여 명 규모의 동아리인 국민대 멋쟁이사자처럼 대표 (2024)
동아리 연합 해커톤 (트렌디톤, 4호선톤) 중앙운영단 참여 (2024)
Goormthon Univ 2기 활동 (2024)
약 300명 규모의 구름톤 유니브 주최의 벚꽃톤 참여
네이버 부스트캠프 챌린지 과정 (2025.07 - 2025.08)
네이버 커넥트 주관 네이버 부스트 캠프 챌린지 과정을 수료
임장혁 7

네이버 부스트캠프 멤버십 과정 (2025.08 - 2026.02)
네이버 커넥트 주관 네이버 부스트 캠프 멤버십 과정을 진행
임장혁 8
`;

const CLOVA_API_URL = process.env.CLOVA_API_URL;
const CLOVA_API_KEY = process.env.CLOVA_API_KEY;

if (!CLOVA_API_URL || !CLOVA_API_KEY) {
  console.error("Error: CLOVA_API_URL or CLOVA_API_KEY is missing in .env");
  process.exit(1);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Valid answers pool
const VALID_ANSWERS = [
  "Redis Lock을 사용하여 주문 처리 시 발생할 수 있는 동시성 문제를 해결하고 데이터 정합성을 보장했습니다.",
  "Kafka는 대용량 메시지 처리에 유리하고, MSA 환경에서 서비스 간 결합도를 낮추기 위해 도입했습니다.",
  "Spring Boot를 사용하여 빠른 개발이 가능했고, JPA를 통해 객체 지향적인 데이터 접근을 구현했습니다.",
  "Docker Compose를 사용하여 로컬 개발 환경과 배포 환경을 일치시켜 환경 차이로 인한 문제를 줄였습니다.",
  "JWT 토큰을 사용하여 Stateless한 인증 방식을 구현하고, 확장성을 고려했습니다."
];

// Nonsense answers pool
const NONSENSE_ANSWERS = [
  "배고파요. 오늘 점심 추천해주세요.",
  "잘 모르겠습니다. 기억이 안 나요.",
  "...",
  "그건 비밀입니다.",
  "다음 질문으로 넘어가주시죠."
];

function getRandomAnswer(): { answer: string; isNonsense: boolean } {
  // 50% chance of nonsense
  if (Math.random() > 0.5) {
      const idx = Math.floor(Math.random() * NONSENSE_ANSWERS.length);
      return { answer: NONSENSE_ANSWERS[idx], isNonsense: true };
  } else {
      const idx = Math.floor(Math.random() * VALID_ANSWERS.length);
      return { answer: VALID_ANSWERS[idx], isNonsense: false };
  }
}

async function fetchAIQuestion(historyMessages: any[], lastAnswer: string, visitedTopics: string[]) {
  const userPrompt = `
        ***[컨텍스트: 이력서 및 포트폴리오]***
        ${USER_INFO}
        
        ***[제외된 주제 (질문 금지)]***
        이미 대화한 다음 주제들에 대해서는 절대 중복하여 질문하지 마십시오:
        [${visitedTopics.join(', ')}]
        
        ***[컨텍스트: 현재 입력]***
        - 직전 지원자 답변: ${lastAnswer || '없음 (첫 질문)'}
    
        !!! 반드시 시스템 프롬프트에 정의된 JSON 형식으로만 답변하십시오. !!!
        Format: { "question": "...", "tags": [...], "isLast": boolean }
  `;

  // Filter out system prompt from history if adding new one
  const filteredHistory = historyMessages.filter(msg => msg.role !== 'system');

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...filteredHistory,
    { role: 'user', content: userPrompt }
  ];

  let retries = 0;
  const maxRetries = 5;

  while (retries <= maxRetries) {
    try {
      const response = await fetch(CLOVA_API_URL!, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CLOVA_API_KEY}`,
          "Content-Type": "application/json",
           "Accept": "application/json",
        },
        body: JSON.stringify({
          messages,
          thinking: { effort: 'none' },
          topP: 0.8, // Test Condition 2
          topK: 0,
          maxCompletionTokens: 1024,
          temperature: 0.5, // Test Condition 2
          repeatPenalty: 1.1,
          seed: 0, 
          responseFormat: {
            type: 'json',
            schema: {
              type: 'object',
              properties: {
                question: { type: 'string' }, // removed minLength
                tags: { type: 'array', items: { type: 'string' } }, // removed minLength
                isLast: { type: 'boolean' },
              },
              required: ['question', 'tags', 'isLast'],
              additionalProperties: false,
            },
          },
        }),
      });

      if (response.status === 429) {
        console.warn(`[429 Too Many Requests] Rate limit exceeded. Waiting 60s before retry... (Attempt ${retries + 1}/${maxRetries})`);
        await sleep(60000); // Wait 60 seconds
        retries++;
        continue;
      }

      if (!response.ok) {
         const text = await response.text();
         console.error(`Status: ${response.status}, Res: ${text}`);
         return null;
      }

      const data: any = await response.json();
      const content = data.result?.message?.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) return null;
      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error(`Error: ${error}`);
      return null;
    }
  }
  return null;
}

async function runSession(sessionId: number) {
  console.log(`\n=== Session #${sessionId} Start ===`);
  const historyMessages: any[] = [];
  const visitedTopics: string[] = [];
  let currentAnswer = ""; 

  for (let turn = 1; turn <= 5; turn++) {
      // console.log(`[Session ${sessionId} | Turn ${turn}] Generating Question...`);
      
      const aiResponse = await fetchAIQuestion(historyMessages, currentAnswer, visitedTopics);
      
      if (!aiResponse) {
          console.error(`[Session ${sessionId} | Turn ${turn}] FAILED to generate question.`);
          break;
      }
      
      // Monitor for empty strings
      if (!aiResponse.question || aiResponse.question.trim().length === 0) {
          console.error(`[CRITICAL FAILURE] Empty Question returned! Answer was: "${currentAnswer}"`);
          // We can break or continue, but logging is essential here.
      } else {
         console.log(`[Turn ${turn}] Q: ${aiResponse.question.substring(0, 50)}... | Tags: ${aiResponse.tags.join(',')}`); 
      }

      historyMessages.push({ role: 'assistant', content: aiResponse.question });
      visitedTopics.push(...aiResponse.tags);

      const { answer, isNonsense } = getRandomAnswer();
      currentAnswer = answer;
      // console.log(`[User Answer (${isNonsense ? 'Nonsense' : 'Valid'})]: ${currentAnswer}`);
      
      historyMessages.push({ role: 'user', content: currentAnswer });

      if (turn < 5) {
          await sleep(10000);
      }
  }
}

async function main() {
  const TOTAL_SESSIONS = 100;
  console.log(`Starting TEST 2: Schema Enforced (NO minLength), Temp 0.4, TopP 0.1`);
  console.log(`Sessions: ${TOTAL_SESSIONS}, Turns per session: 5`);
  
  for (let i = 1; i <= TOTAL_SESSIONS; i++) {
      await runSession(i);
      if (i < TOTAL_SESSIONS) {
          console.log(`Waiting 10s before next session...`);
          await sleep(10000);
      }
  }
  console.log("\nSimulation Completed.");
}

main();
