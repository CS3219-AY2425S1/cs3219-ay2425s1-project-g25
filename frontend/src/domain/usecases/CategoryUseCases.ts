import { categoryRepository } from "data/repositories/CategoryRepositoryImpl";
import { ICategoryRepository } from "domain/repositories/ICategoryRepository";
import { Category } from "domain/entities/Category";

export class CategoryUseCases {
    constructor(private categoryRepository: ICategoryRepository) {}

    /**
     * Retrieves all categories.
     * @returns Promise resolving to an array of Category objects.
     */
    async getAllCategories(): Promise<Category[]> {
        const allCategories = this.categoryRepository.getAllCategories();
		return allCategories;
    }

    /**
     * Creates a new category with the given name.
     * @param name - The name of the category to create.
     * @returns Promise resolving to the newly created Category object.
     * @throws Error if the category name is empty.
     */
    async createCategory(name: string): Promise<any> {
        if (!name || name.trim() === "") {
            throw new Error("Category name cannot be empty");
        }
        return this.categoryRepository.createCategory(name);
    }

    /**
     * Deletes a category by its unique _id.
     * @param _id - The unique identifier of the category to delete.
     * @returns Promise resolving when the category is successfully deleted.
     * @throws Error if the _id is not provided.
     */
    async deleteCategory(_id: string): Promise<void> {
        if (!_id || _id.trim() === "") {
            throw new Error("Category ID must be provided");
        }
        await this.categoryRepository.deleteCategory(_id);
    }
}

export const categoryUseCases = new CategoryUseCases(categoryRepository);
