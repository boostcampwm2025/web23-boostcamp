import { InterviewType } from '../entities/interview.entity';

export class InterviewSummaryListResponse {
    interviews: InterviewSummaryResponse[];
    totalPage: number;
}

export class InterviewSummaryResponse {
    interviewId: string;
    title: string;
    type: InterviewType;
    createdAt: Date;
}
