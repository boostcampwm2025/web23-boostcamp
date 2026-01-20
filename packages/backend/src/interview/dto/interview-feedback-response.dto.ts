import { IsNumber, IsString } from "class-validator";

export class InterviewFeedbackResponse {
    @IsNumber()
    score: number;

    @IsString()
    feedback: string;
}