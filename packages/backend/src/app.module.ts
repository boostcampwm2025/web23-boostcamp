import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { InterviewModule } from './interview/interview.module';
import {UserModule} from "./user/user.module";

@Module({
  imports: [UserModule, AuthModule, DocumentModule, InterviewModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
