import { ForbiddenException } from '@nestjs/common';
import { Interview } from '../../../src/interview/entities/interview.entity';
import { User } from '../../../src/user/entities/user.entity';

describe('Interview Entity', () => {
  let interview: Interview;
  let user: User;

  beforeEach(() => {
    interview = new Interview();
    user = new User();
    user.userId = 'owner_id';
    interview.user = user;
    interview.createdAt = new Date('2023-01-01T10:00:00Z');
    (interview as unknown as { duringTime: number | null }).duringTime = null; // 초기 상태 (DB nullable 시뮬레이션)
  });

  describe('validateUser', () => {
    it('성공: 소유자 접근', () => {
      expect(() => interview.validateUser('owner_id')).not.toThrow();
    });

    it('실패: 타인 접근', () => {
      expect(() => interview.validateUser('other_id')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('calculateDuringTime', () => {
    it('성공: 종료 시간 계산', () => {
      const endTime = new Date('2023-01-01T10:30:00Z'); // 30분 후
      const duration = interview.calculateDuringTime(endTime);
      expect(duration).toBe(30 * 60 * 1000); // 30분 in ms
      expect(interview.duringTime).toBe(30 * 60 * 1000);
    });

    it('실패: 이미 종료된 인터뷰', () => {
      interview.duringTime = 1000;
      const endTime = new Date('2023-01-01T11:00:00Z');
      expect(() => interview.calculateDuringTime(endTime)).toThrow(
        ForbiddenException,
      );
    });

    it('실패: 종료 시간이 시작 시간보다 빠름', () => {
      const endTime = new Date('2023-01-01T09:00:00Z'); //과거
      expect(() => interview.calculateDuringTime(endTime)).toThrow(
        ForbiddenException,
      );
    });
  });
});
