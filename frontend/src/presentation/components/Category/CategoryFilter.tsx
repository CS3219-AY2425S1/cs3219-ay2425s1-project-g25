import React, { useState } from "react";
import { Input, Tag, Button, Modal } from "antd";
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import styles from "./CategoryFilter.module.css";
import { Category } from "domain/entities/Category";

const { CheckableTag } = Tag;

interface CategoryFilterProps {
    allCategories: Category[];
    selectedCategories: Category[];
    onCategoryChange: (category: Category, checked: boolean) => void;
    onAddCategory: (categoryName: string) => void;
    onDeleteCategory: (categoriesToDeleteIds: string[]) => void;
    onClearAllCategories: () => void;
    isEditMode?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    allCategories,
    selectedCategories,
    onCategoryChange,
    onAddCategory,
    onDeleteCategory,
    onClearAllCategories,
    isEditMode = true
}) => {
    const [categorySearchTerm, setCategorySearchTerm] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [deletingMode, setDeletingMode] = useState(false);
    const [categoriesToDelete, setCategoriesToDelete] = useState<string[]>([]);

    const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorySearchTerm(e.target.value);
    };

    const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategory(e.target.value);
    };

    const handleAddCategoryClick = () => {
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory("");
        }
    };

    const toggleDeleteMode = () => {
        setDeletingMode(!deletingMode);
        setCategoriesToDelete([]);
    };

    const handleCategoryToDeleteChange = (categoryId: string, checked: boolean) => {
        const updatedCategories = checked
            ? [...categoriesToDelete, categoryId]
            : categoriesToDelete.filter((c) => c !== categoryId);
        setCategoriesToDelete(updatedCategories);
    };

    const confirmDeletion = () => {
        if (categoriesToDelete.length === 0) {
            Modal.info({
                title: "No Categories Selected",
                content: "Please select at least one category to delete."
            });
            return;
        }

        Modal.confirm({
            title: "Confirm Deletion",
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete the selected ${categoriesToDelete.length} category(ies)?`,
            onOk: () => {
                onDeleteCategory(categoriesToDelete);
                setDeletingMode(false);
                setCategoriesToDelete([]);
            }
        });
    };

    const handleCategoryChange = (category: Category, checked: boolean) => {
        onCategoryChange(category, checked);
    };

    const handleClearAll = () => {
        onClearAllCategories();
    };

    const filteredCategories = allCategories.filter((category) =>
        category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );

    return (
        <div className={styles.categoryDropdownContainer}>
            <Input
                placeholder="Search Categories"
                value={categorySearchTerm}
                onChange={handleCategorySearch}
                className={styles.categorySearchBar}
                allowClear
            />

            {deletingMode && <div className={styles.instructionText}>Select categories to delete</div>}

            <div className={styles.categoriesGrid}>
                {filteredCategories.map((category) => {
                    const isSelectedForDeletion = deletingMode && categoriesToDelete.includes(category._id);
                    const isSelectedForFiltering = selectedCategories.some((c) => c._id === category._id);

                    return (
                        <CheckableTag
                            key={category._id}
                            checked={deletingMode ? isSelectedForDeletion : isSelectedForFiltering}
                            onChange={(checked) =>
                                deletingMode
                                    ? handleCategoryToDeleteChange(category._id, checked)
                                    : handleCategoryChange(category, checked)
                            }
                            className={`${styles.checkableTag} ${
                                isSelectedForDeletion
                                    ? styles.deleteSelectedTag
                                    : isSelectedForFiltering
                                    ? styles.selectedTag
                                    : ""
                            }`}
                        >
                            {category.name}
                        </CheckableTag>
                    );
                })}
            </div>

            {isEditMode && (
                <div className={styles.addCategoryContainer}>
                    <Input
                        placeholder="New Category"
                        value={newCategory}
                        onChange={handleNewCategoryChange}
                        className={styles.newCategoryInput}
                        onPressEnter={handleAddCategoryClick}
                    />
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={handleAddCategoryClick}
                        className={styles.addCategoryButton}
                    >
                        Add
                    </Button>
                </div>
            )}

            <div className={styles.actionButtonsContainer}>
                {isEditMode && (
                    <Button
                        icon={<DeleteOutlined />}
                        type="primary"
                        danger
                        onClick={toggleDeleteMode}
                        className={styles.toggleDeleteButton}
                    >
                        {deletingMode ? "Cancel Delete" : "Delete Categories"}
                    </Button>
                )}

                {selectedCategories.length > 0 && (
                    <Button onClick={handleClearAll} className={styles.clearAllButton}>
                        Clear All
                    </Button>
                )}
            </div>

            {deletingMode && isEditMode && (
                <Button
                    type="default"
                    onClick={confirmDeletion}
                    disabled={categoriesToDelete.length === 0}
                    className={styles.confirmDeleteButton}
                >
                    Confirm Deletion
                </Button>
            )}
        </div>
    );
};
