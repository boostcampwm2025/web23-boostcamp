import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../../../src/auth/auth.service';
import { UserService } from '../../../src/user/user.service';
import { GoogleOAuthService } from '../../../src/auth/google-oauth.service';
import { JwtTokenProvider } from '../../../src/auth/jwt-token.provider';
import { User, UserRole } from '../../../src/user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserService = {
    findOneBySub: jest.fn(),
    registerUser: jest.fn(),
  };

  const mockGoogleOAuthService = {
    exchangeCodeForToken: jest.fn(),
    getUserInfo: jest.fn(),
  };

  const mockJwtTokenProvider = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UserService, useValue: mockUserService },
        { provide: GoogleOAuthService, useValue: mockGoogleOAuthService },
        { provide: JwtTokenProvider, useValue: mockJwtTokenProvider },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('AuthService가 DI로 생성되면 서비스 인스턴스가 정상적으로 정의되어야 한다', () => {
    // Given / When / Then
    expect(service).toBeDefined();
  });

  describe('googleLogin', () => {
    const fixedNow = new Date('2023-01-01T00:00:00Z');

    const code = 'valid_oauth_code';
    const mockToken = 'mock_google_token';

    const mockUserInfo = {
      email: 'test@example.com',
      profileUrl: 'http://test.com/profile',
      sub: 'google_123',
    };

    const mockUser = {
      userId: 'user_1',
      role: UserRole.USER,
    } as User;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('기존 회원이 올바른 OAuth 코드로 로그인하면 accessToken/refreshToken이 발급되어 로그인되어야 한다', async () => {
      // Given
      mockGoogleOAuthService.exchangeCodeForToken.mockResolvedValue(mockToken);
      mockGoogleOAuthService.getUserInfo.mockResolvedValue(mockUserInfo);
      mockUserService.findOneBySub.mockResolvedValue(mockUser);

      mockJwtTokenProvider.generateAccessToken.mockResolvedValue(
        'access_token',
      );
      mockJwtTokenProvider.generateRefreshToken.mockResolvedValue(
        'refresh_token',
      );

      // When
      const result = await service.googleLogin(code);

      // Then
      expect(mockGoogleOAuthService.exchangeCodeForToken).toHaveBeenCalledWith(
        code,
      );
      expect(mockGoogleOAuthService.getUserInfo).toHaveBeenCalledWith(
        mockToken,
      );
      expect(mockUserService.findOneBySub).toHaveBeenCalledWith(
        mockUserInfo.sub,
      );
      expect(mockUserService.registerUser).not.toHaveBeenCalled();

      expect(mockJwtTokenProvider.generateAccessToken).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        fixedNow.getTime(),
      );
      expect(mockJwtTokenProvider.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        fixedNow.getTime(),
      );

      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
    });

    it('신규 회원이 올바른 OAuth 코드로 로그인하면 회원가입 후 accessToken/refreshToken이 발급되어 로그인되어야 한다', async () => {
      // Given
      mockGoogleOAuthService.exchangeCodeForToken.mockResolvedValue(mockToken);
      mockGoogleOAuthService.getUserInfo.mockResolvedValue(mockUserInfo);

      mockUserService.findOneBySub.mockResolvedValue(null);
      mockUserService.registerUser.mockResolvedValue(mockUser);

      mockJwtTokenProvider.generateAccessToken.mockResolvedValue(
        'access_token',
      );
      mockJwtTokenProvider.generateRefreshToken.mockResolvedValue(
        'refresh_token',
      );

      // When
      const result = await service.googleLogin(code);

      // Then
      expect(mockGoogleOAuthService.exchangeCodeForToken).toHaveBeenCalledWith(
        code,
      );
      expect(mockGoogleOAuthService.getUserInfo).toHaveBeenCalledWith(
        mockToken,
      );
      expect(mockUserService.findOneBySub).toHaveBeenCalledWith(
        mockUserInfo.sub,
      );

      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        mockUserInfo.email,
        mockUserInfo.profileUrl,
        mockUserInfo.sub,
      );

      expect(mockJwtTokenProvider.generateAccessToken).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        fixedNow.getTime(),
      );
      expect(mockJwtTokenProvider.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        fixedNow.getTime(),
      );

      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
    });
  });
});
