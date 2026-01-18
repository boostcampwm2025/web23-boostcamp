import { Interview } from './interview.entity';
import { ForbiddenException } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

describe('InterviewEntity 단위 테스트', () => {

    it('인터뷰 진행 시간을 계산한다.', () => {
        // given
        const interview = new Interview();
        //과거 시간으로 수정
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - 1);
        const endTime = new Date();
        const duringTime = endTime.getTime() - startTime.getTime()
        interview.createdAt = startTime;

        // when
        const result = interview.calculateDuringTime(endTime);

        // then
        expect(result).toEqual(duringTime);
    });

    it('인터뷰 진행 시간이 이미 계산되어 있으면, 예외를 반환한다.', () => {
        // given
        const interview = new Interview();
        interview.duringTime = 111;

        // when
        const action = () => interview.calculateDuringTime(new Date());

        // then
        expect(action).toThrow(ForbiddenException);
    });

    it('인터뷰 진행 시간은 음수가 될 수 없다.', () => {
        // given
        const interview = new Interview();
        const now = new Date();
        const after1Hour = new Date(now.getTime() + 60 * 60 * 1000);
        interview.createdAt = after1Hour;

        // when
        const action = () => interview.calculateDuringTime(now);

        // then
        expect(action).toThrow(ForbiddenException);
    });

    it('사용자가 인터뷰의 소유자라면, validataeUser 메서드를 통과한다.', () => {
        // given
        const interview = new Interview();
        const user = new User();
        const interviewOwnerId = '1';
        user.userId = interviewOwnerId;
        interview.user = user;

        // when
        const action = () => interview.validateUser(interviewOwnerId);

        // then
        expect(action).not.toThrow();
    });

    it('사용자가 인터뷰의 소유자가 아니라면, validataeUser 메서드는 예외를 반환한다.', () => {
        // given
        const interview = new Interview();
        const user = new User();
        const interviewOwnerId = '1';
        const nonInterviewOwnerId = '2';
        user.userId = interviewOwnerId;
        interview.user = user;

        // when
        const action = () => interview.validateUser(nonInterviewOwnerId);

        // then
        expect(action).toThrow(ForbiddenException);
    });

});
