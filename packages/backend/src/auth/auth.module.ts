import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { GoogleOAuthService } from './google-oauth.service';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleOAuthService],
})
export class AuthModule { }
