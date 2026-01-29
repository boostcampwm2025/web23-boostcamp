import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../src/user/user.service';
import { UserRepository } from '../../../src/user/user.repository';
import { NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../../../src/user/entities/user.entity';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findById: jest.fn(),
    findBySub: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findExistingUser', () => {
    it('성공: 존재하는 사용자 조회', async () => {
      const mockUser = { userId: '1', userEmail: 'test@example.com' } as User;
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findExistingUser('1');
      expect(result).toEqual(mockUser);
    });

    it('실패: 존재하지 않는 사용자 ID', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findExistingUser('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('registerUser', () => {
    it('성공: 사용자 생성 및 저장', async () => {
      const email = 'new@example.com';
      const profileUrl = 'http://url.com';
      const sub = 'sub_123';
      const savedUser = {
        userId: '1',
        userEmail: email,
        profileUrl,
        sub,
        role: UserRole.USER,
      } as User;

      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.registerUser(email, profileUrl, sub);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });
  });

  describe('getUserProfile', () => {
    it('성공: 프로필 정보 반환', async () => {
      const mockUser = {
        userId: '1',
        userEmail: 'test@example.com',
        profileUrl: 'http://url',
      } as User;
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserProfile('1');
      expect(result).toEqual({
        userId: mockUser.userId,
        email: mockUser.userEmail,
        profileUrl: mockUser.profileUrl,
      });
    });
  });
});
