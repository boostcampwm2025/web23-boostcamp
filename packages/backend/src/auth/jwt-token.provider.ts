import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class JwtTokenProvider {
  private readonly refreshTokenExpiration: string;
  private readonly accessTokenExpiration: string;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiration = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
    );
    this.refreshTokenExpiration = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION',
    );
  }

  async generateAccessToken(
    userId: string,
    role: UserRole,
    issuedAt: number,
  ): Promise<string> {
    const payload = {
      sub: userId,
      role,
      iat: issuedAt,
    };
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenExpiration,
    } as JwtSignOptions);
  }

  async generateRefreshToken(
    userId: string,
    role: UserRole,
    issuedAt: number,
  ): Promise<string> {
    const payload = {
      sub: userId,
      role,
      iat: issuedAt,
    };
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.refreshTokenExpiration,
    } as JwtSignOptions);
  }
}
