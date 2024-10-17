import React, { useState, useEffect } from "react";
import { List, Spin, Alert, message } from "antd";
import { Question } from "../../domain/entities/Question";
import { QuestionCard } from "./QuestionCard";
import { QuestionFilters } from "./QuestionFilters";
import styles from "./QuestionList.module.css";
import { QUESTIONS_LIST_TEXT } from "presentation/utils/constants";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";
import { Category } from "domain/entities/Category";

interface QuestionListProps {
    questions: Question[];
    selectedQuestion: Question | undefined;
    onSelectQuestion: (question: Question) => void;
    isNarrow: boolean;
    isLoading: boolean;
    error: string | null;
    onQuestionsUpdated?: (updatedQuestions: Question[]) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
    questions,
    selectedQuestion,
    onSelectQuestion,
    isNarrow,
    isLoading,
    error,
    onQuestionsUpdated
}) => {
    const [filters, setFilters] = useState({
        selectedDifficulty: "All",
        selectedCategories: [] as string[],
        searchTerm: ""
    });

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories: Category[] = await categoryUseCases.getAllCategories();
                const validCategories = categories.filter(
                    (category) =>
                        typeof category.name === 'string' &&
                        category.name.trim() !== "" &&
                        typeof category._id === 'string' &&
                        category._id.trim() !== ""
                );
                setAllCategories(validCategories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
                message.error("Failed to fetch categories.");
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        setLocalQuestions(questions);
    }, [questions]);

    const handleAddCategory = async (categoryName: string) => {
        if (!categoryName || categoryName.trim() === "") {
            message.error("Category cannot be empty!");
            return;
        }

        const exists = allCategories.some(
            (category) =>
                typeof category.name === 'string' &&
                category.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (exists) {
            message.error("Category already exists!");
            return;
        }

        try {
            const response = await categoryUseCases.createCategory(categoryName);
            const { category } = response;

            if (!category || typeof category._id !== 'string' || typeof category.name !== 'string') {
                message.error("Invalid category data received from backend.");
                console.error("Invalid category data:", category);
                return;
            }

            setAllCategories([...allCategories, category]);
            setFilters({
                ...filters,
                searchTerm: ''
            });

            message.success("Category added successfully!");
        } catch (error) {
            message.error((error as Error).message || "Failed to add category!");
            console.error("Failed to add category:", error);
        }
    };

    const handleDeleteCategory = async (categoriesToDeleteIds: string[]) => {
        try {
            await Promise.all(categoriesToDeleteIds.map((categoryId) => categoryUseCases.deleteCategory(categoryId)));
            setAllCategories(allCategories.filter((category) => !categoriesToDeleteIds.includes(category._id)));
            setFilters({
                ...filters,
                selectedCategories: filters.selectedCategories.filter(c => !categoriesToDeleteIds.includes(c))
            });

            const updatedQuestions = localQuestions.map(question => ({
                ...question,
                categories: question.categories.filter(category => !categoriesToDeleteIds.includes(category._id))
            }));

            setLocalQuestions(updatedQuestions);
            message.success("Categories deleted successfully!");

            onQuestionsUpdated?.(updatedQuestions);
        } catch (error) {
            message.error((error as Error).message || "Failed to delete categories!");
            console.error("Failed to delete categories:", error);
        }
    };

    const handleFiltersChange = (newFilters: {
        selectedDifficulty: string;
        selectedCategories: string[];
        searchTerm: string;
    }) => {
        setFilters(newFilters);
    };

    const filteredQuestions = localQuestions.filter((question) => {
        if (
            filters.selectedDifficulty !== "All" &&
            question.difficulty !== filters.selectedDifficulty
        ) {
            return false;
        }

        if (
            filters.searchTerm &&
            !question.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
        ) {
            return false;
        }

        if (filters.selectedCategories.length > 0) {
            const hasAllSelectedCategories = filters.selectedCategories.every((categoryId) =>
                question.categories.some((category) => category._id === categoryId)
            );
            if (!hasAllSelectedCategories) {
                return false;
            }
        }

        return true;
    });

    const renderItem = (question: Question) => (
        <QuestionCard
            key={question._id}
            question={question}
            isSelected={selectedQuestion?.code === question.code}
            onClick={() => onSelectQuestion(question)}
            isNarrow={isNarrow}
        />
    );

    return (
        <div className={styles.questionListContainer}>
            <QuestionFilters
                allCategories={allCategories}
                onFiltersChange={handleFiltersChange}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
            />
            <div className={styles.listContainer}>
                {isLoading ? (
                    <div className={styles.centerContent}>
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Alert message="Error" description={error} type="error" showIcon />
                ) : filteredQuestions.length === 0 ? (
                    <Alert
                        message={QUESTIONS_LIST_TEXT.NO_QUESTIONS}
                        description={QUESTIONS_LIST_TEXT.NO_QUESTIONS_DESCRIPTION}
                        type="info"
                        showIcon
                    />
                ) : (
                    <List
                        className={styles.list}
                        itemLayout="vertical"
                        dataSource={filteredQuestions}
                        renderItem={renderItem}
                    />
                )}
            </div>
        </div>
    );
};
