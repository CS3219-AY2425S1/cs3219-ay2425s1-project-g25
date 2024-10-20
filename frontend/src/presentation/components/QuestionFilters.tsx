import React, { useState, useEffect, useCallback } from "react";
import { Dropdown, Button, Select, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./QuestionFilters.module.css";
import { difficultyOptions } from "presentation/utils/QuestionUtils";
import { CategoryFilter } from "./Category/CategoryFilter";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";
import { Category } from "domain/entities/Category";
import { SearchBar } from "./SearchBar";

interface QuestionFiltersProps {
    onFiltersChange?: (filters: {
        selectedDifficulty: string | null;
        selectedCategories: Category[] | null;
        searchTerm: string;
    }) => void;
    showSearchBar?: boolean;
    isEditMode?: boolean;
    isSingleCategory?: boolean;
    defaultDifficulty?: string | null;
    defaultCategory?: Category | null;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
    onFiltersChange = () => {},
    showSearchBar = true,
    isEditMode = false,
    isSingleCategory = false,
    defaultDifficulty = "All",
    defaultCategory = null
}) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(defaultDifficulty);
    const [selectedCategories, setSelectedCategories] = useState<Category[] | null>(
        defaultCategory ? [defaultCategory] : null
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (!defaultCategory) {
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
        }
    }, [defaultCategory]);

    const memoizedOnFiltersChange = useCallback(() => {
        onFiltersChange({
            selectedDifficulty,
            selectedCategories,
            searchTerm
        });
    }, [selectedDifficulty, selectedCategories, searchTerm]);

    useEffect(() => {
        memoizedOnFiltersChange();
    }, [selectedDifficulty, selectedCategories, searchTerm, memoizedOnFiltersChange]);

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
        setSelectedCategories(null);
        onFiltersChange({
            selectedDifficulty,
            selectedCategories: null,
            searchTerm
        });
    };

    const handleCategoryChange = (category: Category | null, checked: boolean) => {
        if (category === null) {
            handleClearAllCategories();
            return;
        }

        const updatedSelectedCategories =
            isSingleCategory && checked
                ? [category]
                : checked
                ? selectedCategories
                    ? [...selectedCategories, category]
                    : [category]
                : selectedCategories?.filter((c) => c._id !== category._id) || null;

        setSelectedCategories(updatedSelectedCategories?.length ? updatedSelectedCategories : null);
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
            setSelectedCategories(selectedCategories?.filter((c) => !categoriesToDeleteIds.includes(c._id)) || null);
            message.success("Categories deleted successfully!");
        } catch (error) {
            message.error((error as Error).message || "Failed to delete categories!");
            console.error("Failed to delete categories:", error);
        }
    };

    const dropdownContent = (
        <CategoryFilter
            allCategories={allCategories}
            selectedCategories={selectedCategories || []}
            onCategoryChange={handleCategoryChange}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onClearAllCategories={handleClearAllCategories}
            isEditMode={isEditMode}
            isSingleCategory={isSingleCategory}
            defaultCategory={defaultCategory}
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
                        value={selectedDifficulty}
                        onChange={handleDifficultyChange}
                        className={styles.difficultyFilter}
                        optionLabelProp="label"
                        allowClear
                        options={difficultyOptions}
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
