# 📝 Backend Custom Logger 구현 가이드

이 문서는 NestJS 백엔드 서버에서 체계적인 로그 관리를 위해 사용할 **Custom Logger**의 설계 및 구현 현황을 정의합니다.

## 1. 개요
애플리케이션의 상태를 명확히 파악하고, 문제 발생 시 신속한 원인 분석을 위해 **Winston**을 도입했습니다.
NestJS의 표준 로거 패턴을 유지하며, HTTP 요청 로깅 또한 커스텀 미들웨어를 통해 Winston으로 통일하여 관리하는 구조입니다.

## 2. 로그 레벨 (Log Levels)
로그 레벨은 중요도에 따라 5단계로 구분하여 관리합니다.

| 레벨 | 설명 | 용도 | 사용법 (NestJS Standard) |
| :--- | :--- | :--- | :--- |
| **FATAL** | 치명적 오류 | 시스템 중단, 복구 불가능한 에러 | `logger.error(message, stack)` (syslog level 0) |
| **ERROR** | 일반 오류 | 예외 발생, 기능 실패 | `logger.error(message, stack)` |
| **WARN** | 경고 | 잠재적 문제, 잘못된 입력 | `logger.warn(message)` |
| **INFO** | 정보 | 주요 이벤트, 상태 변경 | `logger.log(message)` |
| **DEBUG** | 디버그 | 개발용 상세 정보, 트레이싱 | `logger.debug(message)` |

### 상세 설명
1. **DEBUG**
   - **설명**: 개발 단계에서 상세한 정보를 기록하기 위한 레벨입니다.
   - **용도**: 애플리케이션의 내부 동작 흐름 추적, 변수 값 확인, 디버깅 목적.
   - **예시**: `User info retrieved: { id: 1, name: 'test' }`, `Query executed: SELECT * FROM ...`

2. **INFO**
   - **설명**: 시스템의 정상적인 실행 상태나 주요 이벤트 정보를 기록합니다.
   - **용도**: 서버 시작/종료, 요청 처리 완료, 스케줄러 실행 등 일반적인 정보 전달.
   - **예시**: `Server started on port 8000`, `User logged in: [userId: 1]`

3. **WARN**
   - **설명**: 에러는 아니지만 주의가 필요한 상황이나, 잠재적인 문제 가능성을 경고합니다.
   - **용도**: 잘못된 입력값(무시 가능), Deprecated 함수 사용, 리소스 사용량 임계치 근접 등.
   - **예시**: `Invalid login attempt (retry 3/5)`, `Memory usage is over 80%`

4. **ERROR**
   - **설명**: 요청 처리 중 발생한 예외나 기능 실패 등 심각한 문제를 기록합니다.
   - **용도**: DB 연결 실패(재시도 가능), 비즈니스 로직 예외, 외부 API 호출 실패 등.
   - **예시**: `Database connection failed`, `Payment processing error: Insufficient funds`

5. **FATAL**
   - **설명**: 애플리케이션의 동작을 중단시켜야 할 만큼 치명적인 오류입니다.
   - **용도**: 시스템 크래시, 필수 구성 요소 누락, 복구 불가능한 데이터 손상 등.
   - **예시**: `System crashed due to out of memory`, `Critical configuration missing`

---

## 3. 구현 기술 스택 (Tech Stack)
- **Framework**: NestJS
- **Application Logger**: `winston`, `nest-winston`
- **HTTP Logger**: Custom Middleware (NestJS Logger)
- **Format**:
  - **Development**: Pretty Print (Colorized, Readable)
  - **Production**: JSON (Timestamped)

## 4. 아키텍처 및 사용법

### 1) Global Logger Replacement
`main.ts`에서 NestJS의 기본 로거를 Winston으로 교체했습니다.
```typescript
const app = await NestFactory.create(AppModule, {
  logger: WinstonModule.createLogger(winstonOptions),
});
```

### 2) 개발자 사용 가이드 (Standard Pattern)
별도의 Winston 의존성을 주입받을 필요 없이, **NestJS의 표준 `Logger` 클래스**를 그대로 사용합니다.
내부적으로 Winston이 연결되어 설정된 포맷대로 로그가 출력됩니다.

```typescript
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
  // Context(클래스명) 자동 주입
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('작업을 시작합니다.'); // -> [MyService] 작업을 시작합니다.
    
    try {
      // ...
    } catch (e) {
      this.logger.error('작업 실패', e.stack); // -> Stack Trace 포함된 Error 로그
    }
  }
}
```

### 3) HTTP Request Logging (Custom Middleware)
외부 라이브러리(`morgan`) 대신, NestJS의 `Logger`를 활용한 커스텀 미들웨어를 구현했습니다.
Winston의 설정을 그대로 따르며, 상태 코드에 따라 로그 레벨을 동적으로 분류하고 요청자 정보(IP, User-Agent)를 포함합니다.

**로그 포맷**:
`METHOD URL STATUS - IP - USER_AGENT +DURATIONms`

**레벨 분기**:
- **ERROR (500 이상)**: `logger.error`
- **WARN (400 이상 500 미만)**: `logger.warn`
- **INFO (나머지)**: `logger.log`

```typescript
// logger.middleware.ts
const message = `${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} +${duration}ms`;

if (statusCode >= 500) {
    this.logger.error(message);
}
// 400 ~ 500 미만 WARN, 그 외 INFO ...
```
