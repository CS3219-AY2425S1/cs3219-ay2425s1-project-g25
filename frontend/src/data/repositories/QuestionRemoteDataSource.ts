import { BaseApi } from "../../infrastructure/Api/BaseApi";
import { Question } from "../../domain/entities/Question";
import { IQuestionInput, IQuestionUpdateInput } from "domain/repositories/IQuestionRepository";

const API_URL = "/api/questions";

export class QuestionRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    /**
     * Fetches all questions.
     * @returns Promise resolving to an array of Question objects.
     */
    async getAllQuestions(): Promise<Question[]> {
        return this.get<Question[]>("/");
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
            difficulty: question.difficulty as string
        };
        return await this.protectedPost<any>("/", payload);
    }

    /**
     * Updates an existing question.
     * @param id - The unique identifier of the question to update.
     * @param questionUpdate - The update data.
     * @returns Promise resolving with the updated question.
     */
    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<any> {
        const payload = {
            ...questionUpdate,
            difficulty: questionUpdate.difficulty as string
        };
        return await this.protectedPut<any>(`/${id}`, payload);
    }

    /**
     * Deletes a question by ID.
     * @param id - The unique identifier of the question to delete.
     * @returns Promise resolving when the question is deleted.
     */
    async deleteQuestion(id: string): Promise<void> {
        await this.protectedDelete<void>(`/${id}`);
    }
}

export const questionRemoteDataSource = new QuestionRemoteDataSource();
