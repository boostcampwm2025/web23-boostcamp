import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { UserService } from '../../../src/user/user.service';
import { UserRepository } from '../../../src/user/user.repository';
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
    jest.clearAllMocks();
  });

  it('UserService가 DI로 생성되면 서비스 인스턴스가 정상적으로 정의되어야 한다', () => {
    // Given: TestingModule로 서비스 생성
    // When: service 접근
    // Then: 정의되어 있어야 함
    expect(service).toBeDefined();
  });

  describe('findExistingUser', () => {
    it('존재하는 사용자 ID로 조회하면 사용자 엔티티가 반환되어야 한다', async () => {
      // Given: repository가 user를 반환함
      const mockUser = { userId: '1', userEmail: 'test@example.com' } as User;
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // When: 사용자 조회
      const result = await service.findExistingUser('1');

      // Then: user가 반환되어야 함
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 사용자 ID로 조회하면 NotFoundException이 발생해야 한다', async () => {
      // Given: repository가 null 반환
      mockUserRepository.findById.mockResolvedValue(null);

      // When / Then: NotFoundException
      await expect(service.findExistingUser('999')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('registerUser', () => {
    it('신규 사용자 정보를 전달해 가입을 요청하면 USER 역할로 저장된 사용자 엔티티가 반환되어야 한다', async () => {
      // Given: 저장될 사용자 정보
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

      // When: 사용자 등록
      const result = await service.registerUser(email, profileUrl, sub);

      // Then: 저장이 호출되고 결과가 반환되어야 함
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });
  });

  describe('getUserProfile', () => {
    it('존재하는 사용자 ID로 프로필 조회를 요청하면 (userId/email/profileUrl) 형태로 반환되어야 한다', async () => {
      // Given: repository가 user를 반환함
      const mockUser = {
        userId: '1',
        userEmail: 'test@example.com',
        profileUrl: 'http://url',
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // When: 프로필 조회
      const result = await service.getUserProfile('1');

      // Then: 필요한 필드만 매핑되어 반환되어야 함
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        userId: mockUser.userId,
        email: mockUser.userEmail,
        profileUrl: mockUser.profileUrl,
      });
    });

    it('존재하지 않는 사용자 ID로 프로필 조회를 요청하면 NotFoundException이 발생해야 한다', async () => {
      // Given: repository가 null 반환
      mockUserRepository.findById.mockResolvedValue(null);

      // When / Then
      await expect(service.getUserProfile('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
