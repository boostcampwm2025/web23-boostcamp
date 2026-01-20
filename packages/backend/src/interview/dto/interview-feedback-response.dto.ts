import { IsNumber, IsString } from "class-validator";

export class InterviewFeedbackResponse {
    @IsNumber()
    score: string;

    @IsString()
    feedback: string;
}