import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../src/auth/jwt-auth.guard';
import { JwtTokenDecoder } from '../../../src/auth/jwt-token.decoder';

type Req = {
  method: string;
  url: string;
  headers: { authorization?: string };
  user?: { userId: string; role: string };
};

function createHttpExecutionContext(request: Req): ExecutionContext {
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => function dummyHandler() {},
    getClass: () => class DummyClass {},
  };

  return context as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockJwtTokenDecoder = {
    decodeToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: JwtTokenDecoder, useValue: mockJwtTokenDecoder },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('Public Endpoint로 설정되어 있으면 토큰 없이도 접근이 허용되어야 한다', () => {
      // Given
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const request: Req = { method: 'GET', url: '/api', headers: {} };
      const context = createHttpExecutionContext(request);

      // When
      const result = guard.canActivate(context);

      // Then
      expect(result).toBe(true);
      expect(mockJwtTokenDecoder.decodeToken).not.toHaveBeenCalled();
      expect(request.user).toBeUndefined();
    });

    it('Private Endpoint에서 유효한 Bearer 토큰을 전달하면 인증이 통과되고 request.user가 주입되어야 한다', () => {
      // Given
      mockReflector.getAllAndOverride.mockReturnValue(false);

      const request: Req = {
        method: 'GET',
        url: '/api',
        headers: { authorization: 'Bearer valid_token' },
      };
      const context = createHttpExecutionContext(request);

      // ✅ Guard가 decoded.sub를 userId로 매핑하는 구현에 맞춤
      mockJwtTokenDecoder.decodeToken.mockReturnValue({
        sub: 'user_1',
        role: 'USER',
      });

      // When
      const result = guard.canActivate(context);

      // Then
      expect(result).toBe(true);
      expect(mockJwtTokenDecoder.decodeToken).toHaveBeenCalledWith(
        'valid_token',
      );
      expect(request.user).toEqual({ userId: 'user_1', role: 'USER' });
    });

    it('Private Endpoint에서 Authorization 헤더가 없으면 UnauthorizedException이 발생해야 한다', () => {
      // Given
      mockReflector.getAllAndOverride.mockReturnValue(false);

      const request: Req = { method: 'GET', url: '/api', headers: {} };
      const context = createHttpExecutionContext(request);

      // When / Then
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(mockJwtTokenDecoder.decodeToken).not.toHaveBeenCalled();
      expect(request.user).toBeUndefined();
    });

    it('Private Endpoint에서 Authorization 헤더가 Bearer 형식이 아니면 UnauthorizedException이 발생해야 한다', () => {
      // Given
      mockReflector.getAllAndOverride.mockReturnValue(false);

      const request: Req = {
        method: 'GET',
        url: '/api',
        headers: { authorization: 'Basic token' },
      };
      const context = createHttpExecutionContext(request);

      // When / Then
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(mockJwtTokenDecoder.decodeToken).not.toHaveBeenCalled();
      expect(request.user).toBeUndefined();
    });
  });
});
