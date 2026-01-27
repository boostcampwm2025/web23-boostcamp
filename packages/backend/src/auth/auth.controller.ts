import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly googleClientId: string;
  private readonly redirectUri: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.googleClientId = configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.redirectUri = configService.getOrThrow<string>('OAUTH_REDIRECT_URI');
  }

  @Get('login/url/google')
  getGoogleLoginUrl(): { url: string } {
    const url = `https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&response_type=code&access_type=offline&redirect_uri=${this.redirectUri}&client_id=${this.googleClientId}`;

    return { url };
  }

  @Get('/signup/oauth')
  async signup(@Query('code') code: string): Promise<any> {
    return await this.authService.googleLogin(code);
  }
}
