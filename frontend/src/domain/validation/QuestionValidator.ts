import { ValidationError } from '../../presentation/utils/errors';
import { ERRORS } from '../../presentation/utils/constants';
import { IQuestionInput, IQuestionUpdateInput } from 'domain/repositories/IQuestionRepository';

export class QuestionValidator {
    static validateQuestionInput(questionInput: IQuestionInput): void {
        if (!questionInput.title || questionInput.title.trim() === '') {
            throw new ValidationError(ERRORS.QUESTION_TITLE_EMPTY);
        }
        if (!questionInput.description || questionInput.description.trim() === '') {
            throw new ValidationError(ERRORS.QUESTION_DESCRIPTION_EMPTY);
        }
        if (!questionInput.categories || questionInput.categories.length === 0) {
            throw new ValidationError(ERRORS.QUESTION_CATEGORY_EMPTY);
        }
        if (!questionInput.difficulty) {
            throw new ValidationError(ERRORS.QUESTION_DIFFICULTY_EMPTY);
        }
    }

    static validateQuestionUpdate(questionUpdate: IQuestionUpdateInput): void {
        if (questionUpdate.title !== undefined && questionUpdate.title.trim() === '') {
            throw new ValidationError(ERRORS.QUESTION_TITLE_EMPTY);
        }
        if (questionUpdate.description !== undefined && questionUpdate.description.trim() === '') {
            throw new ValidationError(ERRORS.QUESTION_DESCRIPTION_EMPTY);
        }
        if (questionUpdate.categories !== undefined && questionUpdate.categories.length === 0) {
            throw new ValidationError(ERRORS.QUESTION_CATEGORY_EMPTY);
        }
    }
}