import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../../src/auth/jwt-auth.guard';
import { JwtTokenDecoder } from '../../../src/auth/jwt-token.decoder';
import { Test, TestingModule } from '@nestjs/testing';

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
  });

  function createMockContext(
    headers: Record<string, unknown>,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/api',
          headers,
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    } as unknown as ExecutionContext;
  }

  describe('canActivate', () => {
    it('성공: Public Endpoint', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      const context = createMockContext({});

      expect(guard.canActivate(context)).toBe(true);
    });

    it('성공: Authenticated with Valid Token', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false); // Not public
      const context = createMockContext({
        authorization: 'Bearer valid_token',
      });

      mockJwtTokenDecoder.decodeToken.mockReturnValue({
        sub: 'user_1',
        role: 'USER',
      });

      expect(guard.canActivate(context)).toBe(true);
      // Verify request['user'] injection implicitly if we could access request,
      // typically guards return true/false/promise.
    });

    it('실패: 토큰 없음', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockContext({}); // No auth header

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('실패: Bearer 형식이 아님', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockContext({ authorization: 'Basic token' });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});
