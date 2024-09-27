import { BaseApi } from '../BaseApi';
import { Question } from '../../domain/entities/Question';
import { IQuestionInput, IQuestionUpdateInput } from 'domain/repositories/IQuestionRepository';

const API_URL = '/api/questions';

export class QuestionRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    /**
     * Fetches all questions.
     * @returns Promise resolving to an array of Question objects.
     */
    async getAllQuestions(): Promise<Question[]> {
        return this.get<Question[]>('/');
    }

    /**
     * Fetches a single question by ID.
     * @param id - The unique identifier of the question.
     * @returns Promise resolving to the Question object.
     */
    async getQuestion(id: string): Promise<Question> {
        return this.get<Question>(`/${id}`);
    }

    /**
     * Creates a new question.
     * @param question - The input data for the new question.
     * @returns Promise resolving with the created question.
     */
    async createQuestion(question: IQuestionInput): Promise<any> {
        const payload = {
            ...question,
            categories: question.categories.map(cat => cat._id),
        };
        return await this.post<any>('/', payload);
    }

    /**
     * Updates an existing question.
     * @param id - The unique identifier of the question to update.
     * @param questionUpdate - The update data.
     * @returns Promise resolving with the updated question.
     */
    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<any> {
        // If categories are being updated, transform them to IDs
        const payload: any = { ...questionUpdate };
        if (questionUpdate.categories) {
            payload.categories = questionUpdate.categories.map(cat => cat._id);
        }
        return await this.put<any>(`/${id}`, payload);
    }

    /**
     * Deletes a question by ID.
     * @param id - The unique identifier of the question to delete.
     * @returns Promise resolving when the question is deleted.
     */
    async deleteQuestion(id: string): Promise<void> {
        await this.delete<void>(`/${id}`);
    }
}

export const questionRemoteDataSource = new QuestionRemoteDataSource();
