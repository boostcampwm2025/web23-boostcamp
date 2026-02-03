import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtTokenProvider } from '../../../src/auth/jwt-token.provider';
import { JwtTokenDecoder } from '../../../src/auth/jwt-token.decoder';
import { UserRole } from '../../../src/user/entities/user.entity';

describe('Jwt 발급/디코딩 통합 테스트', () => {
  let provider: JwtTokenProvider;
  let decoder: JwtTokenDecoder;

  const TEST_SECRET = 'test-secret-key';
  const ACCESS_EXPIRATION = '1h'; // Short expiration for testing
  const REFRESH_EXPIRATION = '14d';

  // 시크릿 키를 주입하기 위한 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: TEST_SECRET,
        }),
      ],
      providers: [
        JwtTokenProvider,
        JwtTokenDecoder,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              switch (key) {
                case 'JWT_SECRET_KEY':
                  return TEST_SECRET;
                case 'JWT_ACCESS_TOKEN_EXPIRATION':
                  return ACCESS_EXPIRATION;
                case 'JWT_REFRESH_TOKEN_EXPIRATION':
                  return REFRESH_EXPIRATION;
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<JwtTokenProvider>(JwtTokenProvider);
    decoder = module.get<JwtTokenDecoder>(JwtTokenDecoder);
  });

  it('애세스 토큰을 발급하고 유효시간내의 토큰을 디코딩할 수 있다.', async () => {
    // given
    const userId = '1';
    const role = UserRole.USER;
    const halfHour = 60 * 30;
    const issuedAt = Math.floor(Date.now() / 1000) - halfHour;

    // when
    const token = await provider.generateAccessToken(userId, role, issuedAt);
    const decoded = decoder.decodeToken(token);

    // then
    expect(token).toBeDefined();
    expect(decoded.sub).toBe(userId);
    expect(decoded.role).toBe(role);
    expect(decoded.iat).toBe(issuedAt);
  });

  it('유효하지 않은 토큰을 디코딩하면, "유효하지 않은 토큰입니다." 예외를 반환한다.', () => {
    // given
    const invalidToken = 'invalid-token';

    // when & then
    expect(() => decoder.decodeToken(invalidToken)).toThrow(
      UnauthorizedException,
    );
    expect(() => decoder.decodeToken(invalidToken)).toThrow(
      '유효하지 않은 토큰입니다.',
    );
  });

  it('만료된 토큰을 디코딩하면, "만료된 토큰입니다." 예외를 반환한다.', async () => {
    // given
    const userId = '1';
    const role = UserRole.ADMIN;
    const twoHour = 2 * 60 * 60;
    const issuedAt = Math.floor(Date.now() / 1000) - twoHour;
    const token = await provider.generateAccessToken(userId, role, issuedAt);

    // when & then
    expect(() => decoder.decodeToken(token)).toThrow(UnauthorizedException);
    expect(() => decoder.decodeToken(token)).toThrow('만료된 토큰입니다.');
  });

  it('리프레시 토큰을 발급하고 유효시간내의 토큰을 디코딩할 수 있다.', async () => {
    //given
    const userId = '1';
    const role = UserRole.USER;
    const aWeek = 7 * 24 * 60 * 60;
    const issuedAt = Math.floor(Date.now() / 1000) - aWeek;

    // when
    const token = await provider.generateRefreshToken(userId, role, issuedAt);
    const decoded = decoder.decodeToken(token);

    // then
    expect(token).toBeDefined();
    expect(decoded.sub).toBe(userId);
    expect(decoded.iat).toBe(issuedAt);
  });
});
