import { IQuestionRepository, IQuestionInput, IQuestionUpdateInput } from '../../domain/repositories/IQuestionRepository';
import { Question } from '../../domain/entities/Question';
import { questionRemoteDataSource } from './QuestionRemoteDataSource';
import { mockQuestionRemoteDataSource } from './mockQuestionRepository';

// Set this to true to use the mock API, false to use the real API
const USE_MOCK_API = false;

export class QuestionRepositoryImpl implements IQuestionRepository {
    private dataSource = USE_MOCK_API ? mockQuestionRemoteDataSource : questionRemoteDataSource;

    async getAllQuestions(): Promise<Question[]> {
        return this.dataSource.getAllQuestions();
    }

    async getQuestion(id: string): Promise<Question> {
        return this.dataSource.getQuestion(id);
    }

    async createQuestion(question: IQuestionInput): Promise<any> {
        return await this.dataSource.createQuestion(question);
    }

    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<any> {
        return await this.dataSource.updateQuestion(id, questionUpdate);
    }

    async deleteQuestion(id: string): Promise<void> {
        await this.dataSource.deleteQuestion(id);
    }
}

export const questionRepository = new QuestionRepositoryImpl();
