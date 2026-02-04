import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokenDecoder } from './jwt-token.decoder';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private readonly jwtTokenDecoder: JwtTokenDecoder,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    const payload = this.jwtTokenDecoder.decodeToken(token);
    this.logger.log(
      `REQUEST METHOD: ${request.method} URI: ${request.url} USERID: ${payload.sub}, ROLE: ${payload.role}`,
    );
    request['user'] = { userId: payload.sub, role: payload.role };

    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Bearer 토큰 형식이 아닙니다.');
    }

    if (!token) {
      throw new UnauthorizedException('Bearer 토큰이 존재하지 않습니다.');
    }

    return token;
  }
}
