import { Category } from "./Category";
import { QuestionDifficulty } from "./QuestionDifficulty";
export interface Question {
	_id: string;
	code: string;
	title: string;
	description: string;
	difficulty: QuestionDifficulty;
	categories: Category[];
	url: string;
}
