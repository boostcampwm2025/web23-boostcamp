import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { GoogleOAuthService } from './google-oauth.service';
import { JwtTokenProvider } from './jwt-token.provider';
import { JwtTokenDecoder } from './jwt-token.decoder';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.getOrThrow('JWT_SECRET_KEY'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleOAuthService,
    JwtTokenProvider,
    JwtTokenDecoder,
    JwtAuthGuard,
  ],
  exports: [JwtTokenProvider, JwtTokenDecoder, JwtAuthGuard],
})
export class AuthModule {}
