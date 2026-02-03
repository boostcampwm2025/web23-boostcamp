API SPEC (for prompt)

공통 규칙
	•	Path params: {param} 또는 :param
	•	날짜 필드: createdAt, modifiedAt 는 date 타입
	•	인증 필요 여부는 “Role” 기준으로 표기
	•	상태코드 204는 응답 바디 없음

⸻

AUTH

1) 로그인
	•	Method: POST
	•	Path: /auth/login
	•	Role: 인증(로그인)
	•	Desc: 로그인 합니다.

⸻

USERS (관리자)

1) 모든 유저 목록
	•	Method: GET
	•	Path: /users
	•	Role: 관리자
	•	Desc: 모든 유저 목록을 조회합니다.
	•	Note: 응답에는 page_size 보다 적은 수의 결과가 나올 수 있습니다.

2) 유저 조회
	•	Method: GET
	•	Path: /users/{user_id}
	•	Role: 관리자
	•	Desc: ID로 학생(유저)을 조회합니다.

⸻

DOCUMENT (자기소개서 / 포트폴리오)

1) 문서 목록 조회
	•	Method: GET
	•	Path: /document
	•	Role: 유저
	•	Query:
	•	page=1
	•	take=6
	•	type=COVER | PORTFOLIO
	•	sort=DESC | ASC
	•	Response:

{
  "documents": [
    {
      "documentId": "string",
      "title": "string",
      "type": "PORTFOLIO | COVER",
      "createdAt": "date",
      "modifiedAt": "date"
    }
  ],
  "totalPage": 2
}


⸻

COVER LETTER (자기소개서)
1) 자기소개서 업로드
	•	Method: POST
	•	Path: /document/cover-letter/create
	•	Role: 유저
	•	Body:

{
  "title": "string",
  "content": [
    { "question": "string", "answer": "string" }
  ]
}

	•	Response:

{
  "documentId": "string",
  "coverletterId": "string",
  "type": "string",
  "title": "string",
  "content": [
    { "question": "string", "answer": "string" }
  ],
  "createdAt": "date"
}

2) 자기소개서 상세 조회
	•	Method: GET
	•	Path: /document/{documentId}/cover-letter
	•	Role: 유저
	•	Response:

{
  "documentId": "string",
  "coverletterId": "string",
  "type": "string",
  "title": "string",
  "content": "string",
  "createdAt": "string",
  "modifiedAt": "date"
}

3) 자기소개서 수정
	•	Method: PUT
	•	Path: /document/{documentId}/cover-letter
	•	Role: 유저
	•	Body:

{
  "title": "string (optional)",
  "content": [
    { "question": "string", "answer": "string" }
  ]
}

	•	Response:

{
  "documentId": "string",
  "coverletterId": "string",
  "type": "string",
  "title": "string",
  "content": [
    { "question": "string", "answer": "string" }
  ],
  "createdAt": "date",
  "modifiedAt": "date"
}

4) 자기소개서 삭제
	•	Method: DELETE
	•	Path: /document/{documentId}/cover-letter
	•	Role: 유저
	•	Response: 204 No Content

⸻

PORTFOLIO (포트폴리오)
1) 포트폴리오 텍스트 업로드
	•	Method: POST
	•	Path: /document/portfolio/create
	•	Role: 유저
	•	Body:

{
  "title": "string",
  "content": "string"
}

	•	Response:

{
  "documentId": "string",
  "portfolioId": "string",
  "type": "string",
  "title": "string",
  "content": "string",
  "createdAt": "date"
}

2) 포트폴리오 상세 조회
	•	Method: GET
	•	Path: /document/{documentId}/portfolio
	•	Role: 유저
	•	Response:

{
  "documentId": "string",
  "portfolioId": "string",
  "type": "string",
  "title": "string",
  "content": "string",
  "createdAt": "date",
  "modifiedAt": "date"
}

3) 포트폴리오 수정
	•	Method: PATCH
	•	Path: /document/{documentId}/portfolio
	•	Role: 유저
	•	Body:

{
  "title": "string (optional)",
  "content": "string (optional)"
}

	•	Response:

{
  "documentId": "string",
  "portfolioId": "string",
  "type": "string",
  "title": "string",
  "content": "string",
  "createdAt": "date",
  "modifiedAt": "date"
}

4) 포트폴리오 삭제
	•	Method: DELETE
	•	Path: /document/{documentId}/portfolio
	•	Role: 유저
	•	Response: 204 No Content

⸻

INTERVIEW (공통 / 기술면접 / 코딩면접)

공통 필드 제안(파편화 API 조합용)
	•	interviewId: string
	•	interviewType: "tech" | "coding" (또는 "TECH" | "CODE" 중 하나로 통일 필요)
	•	interviewTitle: string

⸻

기술 면접 (TECH)
1) 새로운 기술 면접 생성
	•	Method: POST
	•	Path: /interview/tech/create
	•	Role: 유저
	•	Desc: 생성 시 interviewId를 응답에 포함(프론트에서 확인 필요). 생성과 동시에 “첫 질문”도 내려줌.
	•	Body:

{
  "simulationTitle": "string",
  "documentsIds": ["documentId"]
}

	•	Response:

{
  "interviewId": "string",
  "questionId": "string",
  "question": "string",
  "createdAt": "date"
}

2) 기술 면접 질문 생성(진행 중)
	•	Method: POST
	•	Path: /interview/tech/question
	•	Role: 유저
	•	Desc: 면접 진행 중 면접관 질문 생성
	•	Note: 마지막 질문 여부 isLast 포함
	•	Body:

{
  "interviewId": "string"
}

	•	Response:

{
  "questionId": "string",
  "question": "string",
  "createdAt": "date",
  "isLast": true
}

3) 면접 상세 정보 조회
	•	Method: GET
	•	Path: /interview/:interviewId
	•	Role: 유저
	•	Status: 아직 구현 안됨

⸻

대시보드 / 공통 조회
1) 면접 리스트 조회(대시보드)
	•	Method: GET
	•	Path: /interview
	•	Role: 유저
	•	Query:
	•	page=1
	•	take=6
	•	type=TECH | CODE
	•	sort=DESC | ASC
	•	Response:

{
  "interviews": [
    {
      "interviewId": "string",
      "title": "string",
      "type": "TECH | CODE",
      "createdAt": "date"
    }
  ],
  "totalPage": 2
}


⸻

피드백
1) 면접 피드백 조회
	•	Method: GET
	•	Path: /interview/:interviewId/feedback
	•	Role: 유저
	•	Response:

{
  "score": "string",
  "feedback": "string"
}

2) 면접 피드백 생성
	•	Method: POST
	•	Path: /interview/feedback
	•	Role: 유저
	•	Response:

{
  "score": "string",
  "feedback": "string"
}


⸻

종료 / 시간
1) 면접 종료
	•	Method: POST
	•	Path: /interview/stop
	•	Role: 유저
	•	Desc: 면접 진행 시간 계산 후 등록 (now() - createdAt())
	•	Body:

{
  "interviewId": "string"
}

2) 면접 진행 시간 조회
	•	Method: GET
	•	Path: /interview/:interviewId/time
	•	Role: 유저
	•	Response:

{
  "createdAt": "date",
  "duringTime": 0
}


⸻

채팅 / 답변
1) 질의응답 내역 조회
	•	Method: GET
	•	Path: /interview/:interviewId/chat/history
	•	Role: 유저
	•	Response:

{
  "history": [
    {
      "question": "string",
      "questionCreatedAt": "date",
      "answer": "string",
      "answerCreatedAt": "date",
      "code": "string"
    }
  ]
}

2) 질문에 채팅으로 답변
	•	Method: POST
	•	Path: /interview/answer/chat
	•	Role: 유저
	•	Body:

{
  "interviewId": "string",
  "answer": "string"
}

	•	Response:

{
  "answer": "string"
}

3) 질문에 음성으로 답변
	•	Method: POST
	•	Path: /interview/answer/voice
	•	Role: 유저
	•	Body:
	•	interviewId: string
	•	file: media (음성 녹음 파일)
	•	Response:

{
  "answer": "string"
}


⸻

좋아요 (미구현)
1) 면접 좋아요 등록
	•	Method: POST
	•	Path: /interview/like
	•	Role: 유저
	•	Status: 아직 구현 안됨
	•	Body:

{
  "interviewId": "string",
  "like": "LIKE | DISLIKE | NONE"
}

2) 면접 좋아요 조회
	•	Method: GET
	•	Path: /interview/:interviewId/like
	•	Role: 유저
	•	Status: 아직 구현 안됨
	•	Response:

{
  "like": "LIKE | DISLIKE | NONE"
}

