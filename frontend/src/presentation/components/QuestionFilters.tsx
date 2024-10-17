import React, { useState, useEffect } from "react";
import { Dropdown, Button, Select, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./QuestionFilters.module.css";
import { FILTER_DIFFICULTY_TEXT } from "presentation/utils/constants";
import { getDifficultyColor } from "presentation/utils/QuestionUtils";
import { CategoryFilter } from "./Category/CategoryFilter";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";
import { Category } from "domain/entities/Category";
import { SearchBar } from "./SearchBar";

interface QuestionFiltersProps {
    onFiltersChange?: (filters: {
        selectedDifficulty: string;
        selectedCategories: Category[];
        searchTerm: string;
    }) => void;
    showSearchBar?: boolean;
    isEditMode?: boolean;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
    onFiltersChange = () => {},
    showSearchBar = true,
    isEditMode = false
}) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(FILTER_DIFFICULTY_TEXT.ALL);
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories: Category[] = await categoryUseCases.getAllCategories();
                const validCategories = categories.filter(
                    (category) =>
                        typeof category.name === "string" &&
                        category.name.trim() !== "" &&
                        typeof category._id === "string" &&
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
    const handleClearAllCategories = () => {
        setSelectedCategories([]);
        onFiltersChange({
            selectedDifficulty,
            selectedCategories: [],
            searchTerm
        });
    };
    const handleCategoryChange = (category: Category, checked: boolean) => {
        const updatedSelectedCategories = checked
            ? [...selectedCategories, category]
            : selectedCategories.filter((c) => c._id !== category._id);
        setSelectedCategories(updatedSelectedCategories);
        onFiltersChange({
            selectedDifficulty,
            selectedCategories: updatedSelectedCategories,
            searchTerm
        });
    };

    const handleAddCategory = async (categoryName: string) => {
        if (!isEditMode) return;
        if (!categoryName || categoryName.trim() === "") {
            message.error("Category cannot be empty!");
            return;
        }

        const exists = allCategories.some(
            (category) =>
                typeof category.name === "string" && category.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (exists) {
            message.error("Category already exists!");
            return;
        }

        try {
            const response = await categoryUseCases.createCategory(categoryName);
            const { category } = response;

            if (!category || typeof category._id !== "string" || typeof category.name !== "string") {
                message.error("Invalid category data received from backend.");
                console.error("Invalid category data:", category);
                return;
            }

            setAllCategories([...allCategories, category]);
            message.success("Category added successfully!");
        } catch (error) {
            message.error((error as Error).message || "Failed to add category!");
            console.error("Failed to add category:", error);
        }
    };

    const handleDeleteCategory = async (categoriesToDeleteIds: string[]) => {
        if (!isEditMode) return;
        try {
            await Promise.all(categoriesToDeleteIds.map((categoryId) => categoryUseCases.deleteCategory(categoryId)));
            setAllCategories(allCategories.filter((category) => !categoriesToDeleteIds.includes(category._id)));
            setSelectedCategories(selectedCategories.filter((c) => !categoriesToDeleteIds.includes(c._id)));
            message.success("Categories deleted successfully!");
        } catch (error) {
            message.error((error as Error).message || "Failed to delete categories!");
            console.error("Failed to delete categories:", error);
        }
    };

    const dropdownContent = (
        <CategoryFilter
            allCategories={allCategories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onClearAllCategories={handleClearAllCategories}
            isEditMode={isEditMode}
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

            {showSearchBar && (
                <div className={styles.searchBarContainer}>
                    <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
                </div>
            )}
        </div>
    );
};
