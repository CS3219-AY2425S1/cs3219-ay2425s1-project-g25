import { Category } from "domain/entities/Category";

export interface ICategoryRepository {
	getAllCategories(): Promise<Category[]>;
	createCategory(category: string): Promise<Category>;
	deleteCategory(category: string): Promise<void>;
}
