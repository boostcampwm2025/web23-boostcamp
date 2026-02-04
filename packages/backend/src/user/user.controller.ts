import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { UserInfoResponse } from './dto/user-info-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@GetUser() userId: string): Promise<UserInfoResponse> {
    return await this.userService.getUserProfile(userId);
  }
}
