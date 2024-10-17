import { Category } from "domain/entities/Category";

export class MockCategoryRemoteDataSource {
    public categories: Category[] = [
        { _id: '1', name: "Strings" },
        { _id: '2', name: "Algorithms" },
        { _id: '3', name: "Data Structures" },
        { _id: '4', name: "Recursion" },
        { _id: '5', name: "Bit Manipulation" },
        { _id: '6', name: "Databases" },
        { _id: '7', name: "Arrays" },
        { _id: '8', name: "Brainteaser" }
    ];

    /**
     * Fetches all categories.
     * @returns Promise resolving to an array of Category objects.
     */
    async getAllCategories(): Promise<Category[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve([...this.categories]), 300);
        });
    }

    /**
     * Creates a new category.
     * @param categoryName - The name of the category to create.
     * @returns Promise resolving when the category is successfully created.
     */
    async createCategory(categoryName: string): Promise<Category> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const exists = this.categories.some(
                    category => category.name.toLowerCase() === categoryName.toLowerCase()
                );

                if (exists) {
                    console.error(`Category "${categoryName}" already exists.`);
                    reject(new Error('Category already exists'));
                } else {
                    const newCategory: Category = {
                        _id: `${this.categories.length + 1}`,
                        name: categoryName
                    };
                    this.categories.push(newCategory);
                    resolve(newCategory);
                }
            }, 300);
        });
    }

    /**
     * Deletes a category by its _id.
     * @param _id - The unique identifier of the category to delete.
     * @returns Promise resolving when the category is successfully deleted.
     */
    async deleteCategory(_id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.categories.findIndex(category => category._id === _id);
                if (index !== -1) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const deletedCategory = this.categories.splice(index, 1)[0];
                    resolve();
                } else {
                    console.error(`Category with _id "${_id}" not found.`);
                    reject(new Error('Category not found'));
                }
            }, 300);
        });
    }
}

export const mockCategoryRemoteDataSource = new MockCategoryRemoteDataSource();
