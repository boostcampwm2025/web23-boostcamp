import { InterviewAnswer } from '../entities/interview-answer.entity';
import { InterviewQuestion } from '../entities/interview-question.entity';

export class InterviewChatHistoryResponse {
  history: InterviewChatHistory[];

  static fromEntity(
    answers: InterviewAnswer[],
    questions: InterviewQuestion[],
  ): InterviewChatHistoryResponse {
    const history: InterviewChatHistory[] = questions.map((question, index) => {
      const answer = answers[index];
      const historyItem = new InterviewChatHistory();
      const questionResponse = new QuestionResponse(question);
      historyItem.question = questionResponse;

      if (answer) {
        const answerResponse = new AnswerResponse(answer);
        historyItem.answer = answerResponse;
      } else {
        historyItem.answer = null;
      }

      return historyItem;
    });

    const response = new InterviewChatHistoryResponse();
    response.history = history;
    return response;
  }
}

class InterviewChatHistory {
  question: QuestionResponse;
  answer: AnswerResponse | null;
}

class QuestionResponse {
  constructor(question: InterviewQuestion) {
    this.content = question.content;
    this.createdAt = question.createdAt;
  }
  content: string;
  createdAt: Date;
}

class AnswerResponse {
  constructor(answer: InterviewAnswer) {
    this.content = answer.content;
    this.createdAt = answer.createdAt;
  }
  content: string;
  createdAt: Date;
}
