import categoryModel from "../models/Category";
import { Request, Response, NextFunction } from "express";

export async function getAllCategories(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const categories = await categoryModel.find();
        response.status(200).json(categories);
    } catch (error) {
        next(error);
    }
}

export async function createCategory(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { name } = request.body;

    try {
        const existingCategory = await categoryModel.findOne({ name });
        if (existingCategory) {
            return response.status(400).json({
                message: "A category with the given name already exists.",
            });
        }

        const newCategory = new categoryModel({
            name,
        });

        await newCategory.save();

        response.status(200).json({
            message: `New category ${name} created.`,
            category: newCategory
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteCategory(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { _id } = request.params;

    try {
        const deletedCategory = await categoryModel.findOneAndDelete({ _id });

        if (!deletedCategory) {
            return response.status(404).json({
                message: `Category with _id ${_id} not found.`,
            });
        }

        response.status(200).json({
            message: `Category ${_id} deleted successfully.`,
        });
    } catch (error) {
        next(error);
    }
}
