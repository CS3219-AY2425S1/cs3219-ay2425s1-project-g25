import { Category } from "domain/entities/Category";
import { BaseApi } from "../BaseApi";

const API_URL = "/api/categories";

export class CategoryRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    async getAllCategories(): Promise<Category[]> {
        return this.get<Category[]>("/");
    }

    async createCategory(category: string): Promise<Category> {
        return await this.protectedPost<Category>("/", { name: category });
    }

    async deleteCategory(category: string): Promise<void> {
        await this.protectedDelete<void>(`/${category}`);
    }
}

export const categoryRemoteDataSource = new CategoryRemoteDataSource();
