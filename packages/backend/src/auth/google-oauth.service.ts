import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GoogleUserResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export type GoogleUser = {
  email: string;
  profileUrl: string;
  sub: string;
};

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private readonly googleClientId: string;
  private readonly googleClientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.googleClientId =
      this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.googleClientSecret = this.configService.getOrThrow<string>(
      'GOOGLE_CLIENT_SECRET',
    );
    this.redirectUri =
      this.configService.getOrThrow<string>('OAUTH_REDIRECT_URI');
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      this.logger.error('code <-> 애세스 토큰 교환에 실패했습니다.');
      throw new InternalServerErrorException('Failed to get access token');
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    return tokenData.access_token;
  }

  async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!userResponse.ok) {
      this.logger.error('사용자 정보를 가져오는데 실패했습니다.');
      throw new InternalServerErrorException('Failed to get user info');
    }

    const userResponseJson = (await userResponse.json()) as GoogleUserResponse;

    return {
      profileUrl: userResponseJson.picture,
      email: userResponseJson.email,
      sub: userResponseJson.id,
    };
  }
}
