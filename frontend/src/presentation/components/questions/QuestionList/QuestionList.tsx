import React, { useState, useEffect } from "react";
import { List, Spin, Alert } from "antd";
import { Question } from "../../../../domain/entities/Question";
import { QuestionCard } from "./QuestionCard";
import { QuestionFilters } from "./QuestionFilters";
import { Category } from "domain/entities/Category";
import styles from "./QuestionList.module.css";
import { QUESTIONS_LIST_TEXT } from "presentation/utils/constants";

interface QuestionListProps {
    questions: Question[];
    selectedQuestion: Question | undefined;
    onSelectQuestion: (question: Question) => void;
    isNarrow: boolean;
    isLoading: boolean;
    error: string | null;
    onQuestionsUpdated?: (updatedQuestions: Question[]) => void;
    categories?: Category[] | null;
    isEditMode?: boolean;
}

export const QuestionList: React.FC<QuestionListProps> = ({
    questions,
    selectedQuestion,
    onSelectQuestion,
    isNarrow,
    isLoading,
    error,
    onQuestionsUpdated,
    categories = null,
    isEditMode = false
}) => {
    const [filters, setFilters] = useState<{
        selectedDifficulty: string | null;
        selectedCategories: Category[] | null;
        searchTerm: string;
    }>({
        selectedDifficulty: "All",
        selectedCategories: [],
        searchTerm: ""
    });

    const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);

    useEffect(() => {
        setLocalQuestions(questions);
    }, [questions]);

    const handleFiltersChange = (newFilters: {
        selectedDifficulty: string | null;
        selectedCategories: Category[] | null;
        searchTerm: string;
    }) => {
        setFilters(newFilters);
    };

    const filteredQuestions = localQuestions.filter((question) => {
        // 1. Filter by difficulty if it's not "All"
        if (filters.selectedDifficulty && filters.selectedDifficulty !== "All") {
            if (question.difficulty !== filters.selectedDifficulty) {
                return false;
            }
        }

        // 2. Filter by search term if present
        if (filters.searchTerm) {
            const searchTermLower = filters.searchTerm.toLowerCase();
            if (!question.title.toLowerCase().includes(searchTermLower)) {
                return false;
            }
        }

        // 3. Filter by categories if any categories are selected
        if (filters.selectedCategories && filters.selectedCategories.length > 0) {
            const hasAllSelectedCategories = filters.selectedCategories.every((selectedCategory) =>
                question.categories.some((questionCategory) => questionCategory._id === selectedCategory._id)
            );
            if (!hasAllSelectedCategories) {
                return false;
            }
        }

        // If all conditions pass, include the question in the filtered result
        return true;
    });

    return (
        <div className={styles.questionListContainer}>
            <QuestionFilters
                onFiltersChange={handleFiltersChange}
                isEditMode={isEditMode}
                defaultDifficulty={filters.selectedDifficulty}
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
                        renderItem={(question) => (
                            <QuestionCard
                                key={question._id}
                                question={question}
                                isSelected={selectedQuestion?.code === question.code}
                                onClick={() => onSelectQuestion(question)}
                                isNarrow={isNarrow}
                            />
                        )}
                    />
                )}
            </div>
        </div>
    );
};
