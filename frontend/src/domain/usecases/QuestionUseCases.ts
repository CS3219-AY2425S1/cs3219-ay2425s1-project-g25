import { Question } from '../entities/Question';
import { questionRepository } from '../../data/repositories/QuestionRepositoryImpl';
import { NotFoundError } from '../../presentation/utils/errors';
import { IQuestionRepository, IQuestionInput, IQuestionUpdateInput } from 'domain/repositories/IQuestionRepository';
import { QuestionValidator } from 'domain/validation/QuestionValidator';

export class QuestionUseCases {
    constructor(private questionRepository: IQuestionRepository) { }

    /**
     * Fetches all questions.
     * @returns Promise resolving to an array of Question objects.
     */
    async getAllQuestions(): Promise<Question[]> {
        const allQuestions = this.questionRepository.getAllQuestions();
        return allQuestions;
    }

    /**
     * Fetches a single question by ID.
     * @param id - The unique identifier of the question.
     * @returns Promise resolving to the Question object.
     * @throws NotFoundError if the question does not exist.
     */
    async getQuestion(id: string): Promise<Question> {
        const question = await this.questionRepository.getQuestion(id);
        if (!question) {
            throw new NotFoundError('Question not found');
        }
        return question;
    }

    /**
     * Creates a new question.
     * @param questionInput - The input data for the new question.
     * @returns Promise resolving with the created question.
     */
    async createQuestion(questionInput: IQuestionInput): Promise<any> {
        QuestionValidator.validateQuestionInput(questionInput);
        return await this.questionRepository.createQuestion(questionInput);
    }

    /**
     * Updates an existing question.
     * @param id - The unique identifier of the question to update.
     * @param questionUpdate - The update data.
     * @returns Promise resolving with the updated question.
     */
    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<any> {
        QuestionValidator.validateQuestionUpdate(questionUpdate);
        return await this.questionRepository.updateQuestion(id, questionUpdate);
    }

    /**
     * Deletes a question by ID.
     * @param id - The unique identifier of the question to delete.
     * @returns Promise resolving when the question is deleted.
     */
    async deleteQuestion(id: string): Promise<void> {
        await this.questionRepository.deleteQuestion(id);
    }

    /**
     * Fetches questions filtered by difficulty.
     * @param difficulty - The difficulty level to filter by.
     * @returns Promise resolving to an array of filtered Question objects.
     */
    async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        return allQuestions.filter((question) => question.difficulty === difficulty);
    }

    /**
     * Fetches questions filtered by a specific category.
     * @param categoryId - The unique identifier of the category to filter by.
     * @returns Promise resolving to an array of filtered Question objects.
     */
    async getQuestionsByCategory(categoryId: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        return allQuestions.filter((question) =>
            question.categories.some((cat) => cat._id === categoryId)
        );
    }

    /**
     * Searches questions based on a search term.
     * @param searchTerm - The term to search for in questions.
     * @returns Promise resolving to an array of matching Question objects.
     */
    async searchQuestions(searchTerm: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        const lowerSearchTerm = searchTerm.toLowerCase();
        return allQuestions.filter((question) =>
            question.title.toLowerCase().includes(lowerSearchTerm) ||
            question.description.toLowerCase().includes(lowerSearchTerm) ||
            question.categories.some((cat) =>
                cat.name.toLowerCase().includes(lowerSearchTerm) ||
                cat._id.toLowerCase().includes(lowerSearchTerm)
            )
        );
    }

    /**
     * Generates statistics about the questions.
     * @returns Promise resolving to an object containing total count and breakdowns by difficulty and category.
     */
    async getQuestionStats(): Promise<{
        total: number;
        byDifficulty: Record<string, number>;
        byCategory: Record<string, number>;
    }> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        const stats = {
            total: allQuestions.length,
            byDifficulty: {} as Record<string, number>,
            byCategory: {} as Record<string, number>,
        };

        allQuestions.forEach((question) => {
            stats.byDifficulty[question.difficulty] = (stats.byDifficulty[question.difficulty] || 0) + 1;

            question.categories.forEach((category) => {
                const categoryName = category.name;
                stats.byCategory[categoryName] = (stats.byCategory[categoryName] || 0) + 1;
            });
        });

        return stats;
    }
}

export const questionUseCases = new QuestionUseCases(questionRepository);
