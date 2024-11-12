import questionModel from "../models/Question";
import categoryModel from "../models/Category";
import { Request, Response, NextFunction } from "express";
import { EachMessagePayload } from "kafkajs";
import { producer, QUESTION_TOPIC } from "../utils/kafkaClient";
import { Types } from "mongoose";
import historyEntryModel from "../models/HistoryEntry";

const DIFFICULTIES = ["easy", "medium", "hard"];

export async function getAllQuestions(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const questions = await questionModel.find().populate("categories");
        response.status(200).json(questions);
    } catch (error) {
        next(error);
    }
}

export async function createQuestion(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { title, description, difficulty, categories, url } = req.body;

    try {
        const existingQuestion = await questionModel.findOne({ title });
        if (existingQuestion) {
            return res.status(400).json({
                message: "A question with the given title already exists.",
            });
        }

        const categoryIds = await Promise.all(
            categories.map(async (categoryName: string) => {
                let category = await categoryModel.findOne({
                    name: categoryName,
                });
                if (!category) {
                    category = new categoryModel({ name: categoryName });
                    await category.save();
                }
                return category._id;
            })
        );

        const largestQuestion = await questionModel
            .findOne()
            .sort({ code: -1 });
        const code = largestQuestion ? largestQuestion.code + 1 : 1;

        const newQuestion = new questionModel({
            code,
            title,
            description,
            difficulty,
            categories: categoryIds,
        });
        if (url) newQuestion.url = url;

        await newQuestion.save();

        const populatedQuestion = await newQuestion.populate("categories");

        res.status(201).json({
            message: `New question ${code}: ${title} created.`,
            question: populatedQuestion,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateQuestion(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { id } = request.params;
    let { categories, ...updateData } = request.body;

    try {
        if (updateData.title) {
            const existingTitle = await questionModel.findOne({
                title: updateData.title,
                _id: { $ne: id },
            });
            if (existingTitle) {
                return response.status(400).json({
                    message: "A question with the given title already exists.",
                });
            }
        }

        if (categories) {
            const categoryIds = await Promise.all(
                categories.map(async (categoryName: string) => {
                    let category = await categoryModel.findOne({
                        name: categoryName,
                    });
                    if (!category) {
                        category = new categoryModel({ name: categoryName });
                        await category.save();
                    }
                    return category._id;
                })
            );
            updateData = { ...updateData, categories: categoryIds };
        }

        const updatedQuestion = await questionModel
            .findOneAndUpdate(
                { _id: id },
                { $set: updateData },
                { new: true, runValidators: true }
            )
            .populate("categories");

        if (!updatedQuestion) {
            return response.status(404).json({
                message: `Question with _id ${id} not found.`,
            });
        }

        response.status(200).json({
            message: `Question ${id} updated successfully.`,
            updatedQuestion,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteQuestion(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { id } = request.params;

    try {
        await historyEntryModel.deleteMany({ question: id });
        const deletedQuestion = await questionModel.findOneAndDelete({
            _id: id,
        });

        if (!deletedQuestion) {
            return response.status(404).json({
                message: `Question with _id ${id} not found.`,
            });
        }

        response.status(200).json({
            message: `Question ${id} deleted successfully.`,
        });
    } catch (error) {
        next(error);
    }
}

export async function getQuestion(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { id } = request.params;

    try {
        const question = await questionModel.findOne({ _id: id });
        if (!question) {
            return response.status(404).json({
                message: `Question with _id ${id} not found.`,
            });
        }

        const populatedQuestion = await question.populate("categories");

        response.status(200).json(populatedQuestion);
    } catch (error) {
        next(error);
    }
}

/**
 * Process the message from the Kafka topic and get a suitable question with same category and same difficulty (if possible).
 * Sends the question ID back to the matching service.
 * @param message - Kafka message payload
 */
export async function getSuitableQuestion(message: EachMessagePayload) {
    console.log("Question service getting suitable question.");
    const body = message.message.value?.toString();
    const matchId = message.message.key?.toString();

    if (!body || !matchId) {
        console.error("No message body or Match ID found.");
        return;
    }

    const { category, difficulty } = JSON.parse(body);

    try {
        const question = await findSuitableQuestion(category, difficulty);
        if (!question) {
            throw new Error("No suitable question found.");
        }

        const messageBody = JSON.stringify({
            question: question._id.toString(),
        });

        await producer.send({
            topic: QUESTION_TOPIC,
            messages: [
                {
                    key: matchId,
                    value: messageBody,
                },
            ],
        });
    } catch (error) {
        console.error("Error finding suitable question:", error);
    }
}

async function findSuitableQuestion(categoryName: string, difficulty: string) {
    try {
        let category = null;

        if (categoryName.toLowerCase() !== "all") {
            category = await categoryModel.findOne({
                name: new RegExp(`^${categoryName}$`, "i"),
            });

            if (!category) {
                throw new Error(`Category '${categoryName}' not found.`);
            }
        }

        const query: { categories?: Types.ObjectId; difficulty?: RegExp } = {
            ...(category ? { categories: category._id } : {}),
        };

        if (difficulty.toLowerCase() !== "all") {
            query.difficulty = new RegExp(`^${difficulty}$`, "i");
        }
        console.log(query);

        // Attempt to find a question with the exact specified difficulty
        let questions = await questionModel.aggregate([
            { $match: query },
            { $sample: { size: 1 } },
        ]);

        if (questions.length > 0) {
            return questions[0];
        }

        const difficultyIndex = DIFFICULTIES.indexOf(difficulty.toLowerCase());
        if (difficultyIndex === -1) {
            throw new Error(`Invalid difficulty level: ${difficulty}`);
        }

        // Adjust the search to find the nearest difficulty level, starting with lower levels
        for (let i = difficultyIndex - 1; i >= 0; i--) {
            query.difficulty = new RegExp(`^${DIFFICULTIES[i]}$`, "i"); // Case-insensitive exact match for lower difficulty
            questions = await questionModel.aggregate([
                { $match: query },
                { $sample: { size: 1 } },
            ]);
            if (questions.length > 0) {
                return questions[0];
            }
        }

        // Check higher difficulty levels if lower levels are unavailable
        for (let i = difficultyIndex + 1; i < DIFFICULTIES.length; i++) {
            query.difficulty = new RegExp(`^${DIFFICULTIES[i]}$`, "i"); // Case-insensitive exact match for higher difficulty
            questions = await questionModel.aggregate([
                { $match: query },
                { $sample: { size: 1 } },
            ]);
            if (questions.length > 0) {
                return questions[0];
            }
        }

        return null;
    } catch (error) {
        console.error("Error finding suitable question:", error);
    }
}
