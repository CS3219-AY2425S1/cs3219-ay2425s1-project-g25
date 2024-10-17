import React, { useState, useEffect } from "react";
import { List, Spin, Alert } from "antd";
import { Question } from "../../domain/entities/Question";
import { QuestionCard } from "./QuestionCard";
import { QuestionFilters } from "./QuestionFilters";
import { Category } from "domain/entities/Category"; // Import Category entity
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
        selectedCategories: [] as Category[],
        searchTerm: ""
    });

    const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);

    useEffect(() => {
        setLocalQuestions(questions);
    }, [questions]);

    const handleFiltersChange = (newFilters: {
        selectedDifficulty: string;
        selectedCategories: Category[];
        searchTerm: string;
    }) => {
        setFilters(newFilters);
    };

    const filteredQuestions = localQuestions.filter((question) => {
        if (filters.selectedDifficulty !== "All" && question.difficulty !== filters.selectedDifficulty) {
            return false;
        }

        if (filters.searchTerm && !question.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
            return false;
        }

        if (filters.selectedCategories.length > 0) {
            const hasAllSelectedCategories = filters.selectedCategories.every((selectedCategory) =>
                question.categories.some((questionCategory) => questionCategory._id === selectedCategory._id)
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
            <QuestionFilters onFiltersChange={handleFiltersChange} isEditMode={true} />
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
