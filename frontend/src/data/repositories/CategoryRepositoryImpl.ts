import { Category } from 'domain/entities/Category';
import { categoryRemoteDataSource } from './CategoryRemoteDataSource';
import { mockCategoryRemoteDataSource } from './mockCategoryRepository';

// Set this to true to use the mock API, false to use the real API
const USE_MOCK_API = false;

export class CategoryRepositoryImpl {
    private dataSource = USE_MOCK_API ? mockCategoryRemoteDataSource : categoryRemoteDataSource;

    async getAllCategories(): Promise<Category[]> {
        return this.dataSource.getAllCategories();
    }

    async createCategory(category: string): Promise<Category> {
        
        return this.dataSource.createCategory(category);
    }

    async deleteCategory(category: string): Promise<void> {
        await this.dataSource.deleteCategory(category);
    }
}

export const categoryRepository = new CategoryRepositoryImpl();
