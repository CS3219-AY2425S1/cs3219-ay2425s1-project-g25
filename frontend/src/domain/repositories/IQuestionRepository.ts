import { QuestionDifficulty } from "domain/entities/QuestionDifficulty";
import { Question } from "../entities/Question";

export interface IQuestionInput {
	title: string;
	description: string;
	difficulty: QuestionDifficulty;
	categories: string[];
	url: string;
}

export interface IQuestionUpdateInput {
	title?: string;
	description?: string;
	categories?: string[];
	difficulty?: QuestionDifficulty;
	url?: string;
}

export interface IQuestionRepository {
	getAllQuestions(): Promise<Question[]>;
	getQuestion(id: string): Promise<Question>;
	createQuestion(question: IQuestionInput): Promise<any>;
	updateQuestion(
		id: string,
		questionUpdate: IQuestionUpdateInput
	): Promise<void>;
	deleteQuestion(id: string): Promise<void>;
}
