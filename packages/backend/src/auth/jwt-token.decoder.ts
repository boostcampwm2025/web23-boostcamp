import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../user/entities/user.entity';

export interface TokenPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtTokenDecoder {
  private readonly logger = new Logger(JwtTokenDecoder.name);

  constructor(private readonly jwtService: JwtService) {}

  decodeToken(token: string): TokenPayload {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      this.logger.error((e as Error).message, (e as Error).stack);
      if (e instanceof Error) {
        if (e.name === 'TokenExpiredError') {
          throw new UnauthorizedException('만료된 토큰입니다.');
        }
        if (e.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('유효하지 않은 토큰입니다.');
        }
      }
      throw new UnauthorizedException('Jwt 토큰 디코딩에 실패했습니다.');
    }
  }
}
