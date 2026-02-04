import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserInfoResponse } from './dto/user-info-response.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');

  constructor(private readonly userRepository: UserRepository) {}

  async findExistingUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(`user ${userId} not found`);
      throw new NotFoundException('존재하지않는 사용자입니다.');
    }
    return user;
  }

  async findOneBySub(sub: string): Promise<User | null> {
    return await this.userRepository.findBySub(sub);
  }

  async registerUser(
    email: string,
    profileUrl: string,
    sub: string,
  ): Promise<User> {
    const user = new User();
    user.userEmail = email;
    user.profileUrl = profileUrl;
    user.sub = sub;
    return await this.userRepository.save(user);
  }

  async getUserProfile(userId: string): Promise<UserInfoResponse> {
    const user = await this.findExistingUser(userId);
    return {
      userId: user.userId,
      email: user.userEmail,
      profileUrl: user.profileUrl,
    };
  }
}
