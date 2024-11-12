export interface ProductModel {
    id: string;
    name: string;
    price: number;
    description?: string;
    stock: number;
    tags?: string[];
}