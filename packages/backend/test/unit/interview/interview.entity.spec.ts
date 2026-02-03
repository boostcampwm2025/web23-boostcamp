import { ForbiddenException } from '@nestjs/common';
import { Interview } from '../../../src/interview/entities/interview.entity';
import { User } from '../../../src/user/entities/user.entity';

describe('Interview Entity', () => {
  let interview: Interview;

  beforeEach(() => {
    interview = new Interview();

    const user = new User();
    user.userId = 'owner_id';

    interview.user = user;
    interview.createdAt = new Date('2023-01-01T10:00:00Z');

    // DB nullable(duringTime) 초기 상태 시뮬레이션
    (interview as unknown as { duringTime: number | null }).duringTime = null;
  });

  describe('validateUser', () => {
    it('인터뷰 소유자가 자신의 인터뷰에 접근하면 예외 없이 통과되어야 한다', () => {
      // Given: interview.user.userId = owner_id
      // When / Then: owner_id로 접근 시 예외가 발생하지 않아야 한다
      expect(() => interview.validateUser('owner_id')).not.toThrow();
    });

    it('인터뷰 소유자가 아닌 사용자가 접근하면 ForbiddenException이 발생해야 한다', () => {
      // Given: interview.user.userId = owner_id
      // When / Then: other_id로 접근 시 ForbiddenException이 발생해야 한다
      expect(() => interview.validateUser('other_id')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('calculateDuringTime', () => {
    it('인터뷰가 종료되지 않은 상태에서 종료 시간을 전달하면 duringTime이 (종료-시작)으로 계산되어 저장되어야 한다', () => {
      // Given: createdAt=10:00, duringTime=null
      const endTime = new Date('2023-01-01T10:30:00Z'); // 30분 후
      const expected = 30 * 60 * 1000;

      // When
      const duration = interview.calculateDuringTime(endTime);

      // Then: 반환값과 엔티티 내부 duringTime이 기대값과 같아야 한다
      expect(duration).toBe(expected);
      expect(interview.duringTime).toBe(expected);
    });

    it('이미 종료된 인터뷰에서 종료 시간을 다시 계산하려 하면 ForbiddenException이 발생해야 한다', () => {
      // Given: 이미 duringTime이 설정됨(종료된 상태)
      interview.duringTime = 1000;
      const endTime = new Date('2023-01-01T11:00:00Z');

      // When / Then: 재종료 시도는 ForbiddenException이어야 한다
      expect(() => interview.calculateDuringTime(endTime)).toThrow(
        ForbiddenException,
      );
    });

    it('종료 시간이 시작 시간(createdAt)보다 빠르면 ForbiddenException이 발생해야 한다', () => {
      // Given: createdAt=10:00
      const endTime = new Date('2023-01-01T09:00:00Z'); // 과거

      // When / Then: 음수 duration은 허용되지 않아야 한다
      expect(() => interview.calculateDuringTime(endTime)).toThrow(
        ForbiddenException,
      );
    });

    it('종료 시간이 시작 시간과 같으면 duringTime은 0으로 계산되어 저장되어야 한다', () => {
      // Given: createdAt=10:00, endTime=10:00
      const endTime = new Date('2023-01-01T10:00:00Z');

      // When
      const duration = interview.calculateDuringTime(endTime);

      // Then
      expect(duration).toBe(0);
      expect(interview.duringTime).toBe(0);
    });
  });
});
