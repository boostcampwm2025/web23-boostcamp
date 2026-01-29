import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('googleLogin', () => {
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

    it('성공: 기존 회원 로그인', async () => {
      mockGoogleOAuthService.exchangeCodeForToken.mockResolvedValue(mockToken);
      mockGoogleOAuthService.getUserInfo.mockResolvedValue(mockUserInfo);
      mockUserService.findOneBySub.mockResolvedValue(mockUser);
      mockJwtTokenProvider.generateAccessToken.mockResolvedValue(
        'access_token',
      );
      mockJwtTokenProvider.generateRefreshToken.mockResolvedValue(
        'refresh_token',
      );

      const result = await service.googleLogin(code);

      expect(mockGoogleOAuthService.exchangeCodeForToken).toHaveBeenCalledWith(
        code,
      );
      expect(mockUserService.findOneBySub).toHaveBeenCalledWith(
        mockUserInfo.sub,
      );
      expect(mockUserService.registerUser).not.toHaveBeenCalled(); // 기존 회원이므로 등록 안 함
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
    });

    it('성공: 신규 회원 가입 후 로그인', async () => {
      mockGoogleOAuthService.exchangeCodeForToken.mockResolvedValue(mockToken);
      mockGoogleOAuthService.getUserInfo.mockResolvedValue(mockUserInfo);
      mockUserService.findOneBySub.mockResolvedValue(null); // 회원 없음
      mockUserService.registerUser.mockResolvedValue(mockUser); // 회원 가입 성공
      mockJwtTokenProvider.generateAccessToken.mockResolvedValue(
        'access_token',
      );
      mockJwtTokenProvider.generateRefreshToken.mockResolvedValue(
        'refresh_token',
      );

      const result = await service.googleLogin(code);

      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        mockUserInfo.email,
        mockUserInfo.profileUrl,
        mockUserInfo.sub,
      );
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
    });
  });
});
