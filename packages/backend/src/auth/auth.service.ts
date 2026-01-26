import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { GoogleOAuthService } from './google-oauth.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly googleOAuthService: GoogleOAuthService,
    ) { }

    async googleLogin(code: string): Promise<any> {
        const accessToken =
            await this.googleOAuthService.exchangeCodeForToken(code);
        const userData = await this.googleOAuthService.getUserInfo(accessToken);

        const email = userData.email;
        const profileUrl = userData.picture;
        const sub = userData.id;

        // 기존에 회원이 존재하는지 찾는다.
        let user = await this.userService.findOneBySub(sub);

        // 신규 회원이라면 회원 정보를 DB에 등록한다.
        if (!user) {
            user = await this.userService.registerUser(email, profileUrl, sub);
        }

        return user;
    }
}
