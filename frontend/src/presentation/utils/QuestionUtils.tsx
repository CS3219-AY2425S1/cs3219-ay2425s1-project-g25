import { QuestionDifficulty } from "domain/entities/QuestionDifficulty";
import { IQuestionInput } from "domain/repositories/IQuestionRepository";
import { FILTER_DIFFICULTY_TEXT } from "./constants";

export const getDifficultyColor = (difficulty: QuestionDifficulty): string => {
	switch (difficulty) {
		case "Easy":
			return "green";
		case "Medium":
			return "goldenrod";
		case "Hard":
			return "red";
		default:
			return "gray";
	}
};

export const getStatusColor = (status: string): string => {
	switch (status) {
		case "complete":
			return "green";
		case "working":
			return "blue";
		case "starting":
			return "gold";
		default:
			return "gray";
	}
};

export const difficultyOptions: {
	value: QuestionDifficulty;
	label: JSX.Element | string;
}[] = [
	{
		value: FILTER_DIFFICULTY_TEXT.EASY as QuestionDifficulty,
		label: <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.EASY) }}>{FILTER_DIFFICULTY_TEXT.EASY}</span>,
	},
	{
		value: FILTER_DIFFICULTY_TEXT.MEDIUM as QuestionDifficulty,
		label: <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.MEDIUM) }}>{FILTER_DIFFICULTY_TEXT.MEDIUM}</span>,
	},
	{
		value: FILTER_DIFFICULTY_TEXT.HARD as QuestionDifficulty,
		label: <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.HARD) }}>{FILTER_DIFFICULTY_TEXT.HARD}</span>,
	},
];

const templateQuestionDescription: string = `
### Problem

Describe your problem here

### Instructions

Describe your instructions here

### Example

**Input:**
\`\`\`
Input example 1
\`\`\`

**Output:**
\`\`\`
Output example 1
\`\`\`

### Constraints

- Constraint 1
- Constraint 2
`;

export const initialQuestionInput: IQuestionInput = {
	title: "",
	description: templateQuestionDescription,
	difficulty: "Easy",
	categories: [],
	url: "",
};
