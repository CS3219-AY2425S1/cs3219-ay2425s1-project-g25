import React, { useState } from "react";
import { Dropdown, Button, Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./QuestionFilters.module.css";
import { FILTER_DIFFICULTY_TEXT } from "presentation/utils/constants";
import { getDifficultyColor } from "presentation/utils/QuestionUtils";
import { CategoryFilter } from "./Category/CategoryFilter";
import { Category } from "domain/entities/Category";
import { SearchBar } from "./SearchBar";

interface QuestionFiltersProps {
    allCategories: Category[];
    onFiltersChange: (filters: {
        selectedDifficulty: string;
        selectedCategories: string[];
        searchTerm: string;
    }) => void;
    onAddCategory: (categoryName: string) => void;
    onDeleteCategory: (categoriesToDeleteIds: string[]) => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
    allCategories,
    onFiltersChange,
    onAddCategory,
    onDeleteCategory
}) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(FILTER_DIFFICULTY_TEXT.ALL);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        onFiltersChange({
            selectedDifficulty,
            selectedCategories,
            searchTerm: term
        });
    };

    const handleDifficultyChange = (value: string) => {
        setSelectedDifficulty(value);
        onFiltersChange({
            selectedDifficulty: value,
            selectedCategories,
            searchTerm
        });
    };

    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        const updatedSelectedCategories = checked
            ? [...selectedCategories, categoryId]
            : selectedCategories.filter((c) => c !== categoryId);
        setSelectedCategories(updatedSelectedCategories);
        onFiltersChange({
            selectedDifficulty,
            selectedCategories: updatedSelectedCategories,
            searchTerm
        });
    };

    const dropdownContent = (
        <CategoryFilter
            allCategories={allCategories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
        />
    );

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersRow}>
                <div className={styles.filterItem}>
                    <Dropdown
                        trigger={["click"]}
                        placement="bottomLeft"
                        overlayClassName={styles.categoryDropdownOverlay}
                        dropdownRender={() => dropdownContent}
                    >
                        <Button className={styles.categoriesFilterButton}>
                            Categories <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>

                <div className={styles.filterItem}>
                    <Select
                        placeholder="Choose Difficulty"
                        value={
                            selectedDifficulty === FILTER_DIFFICULTY_TEXT.ALL ? "Choose Difficulty" : selectedDifficulty
                        }
                        onChange={handleDifficultyChange}
                        className={styles.difficultyFilter}
                        optionLabelProp="label"
                        allowClear
                        options={[
                            {
                                value: FILTER_DIFFICULTY_TEXT.ALL,
                                label: <span>All</span>
                            },
                            {
                                value: FILTER_DIFFICULTY_TEXT.EASY,
                                label: (
                                    <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.EASY) }}>
                                        {FILTER_DIFFICULTY_TEXT.EASY}
                                    </span>
                                )
                            },
                            {
                                value: FILTER_DIFFICULTY_TEXT.MEDIUM,
                                label: (
                                    <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.MEDIUM) }}>
                                        {FILTER_DIFFICULTY_TEXT.MEDIUM}
                                    </span>
                                )
                            },
                            {
                                value: FILTER_DIFFICULTY_TEXT.HARD,
                                label: (
                                    <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.HARD) }}>
                                        {FILTER_DIFFICULTY_TEXT.HARD}
                                    </span>
                                )
                            }
                        ]}
                    />
                </div>
            </div>

            <div className={styles.searchBarContainer}>
                <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
            </div>
        </div>
    );
};
